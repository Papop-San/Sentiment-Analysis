from flask import Flask, request, jsonify
from googleapiclient.discovery import build
import re
import emoji
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from pythainlp import word_tokenize
from pythainlp.corpus.common import thai_stopwords

app = Flask(__name__)

# Initialize the SentimentIntensityAnalyzer
analyzer = SentimentIntensityAnalyzer()

API_KEY = 'AIzaSyAP-fOU-2qVPVPwsGdn3r_E1w9y_H-tus8'  # Replace with your actual API key
youtube = build('youtube', 'v3', developerKey=API_KEY)

# Thai stopwords
thai_stopwords = list(thai_stopwords())

# Analyze the sentiment of a comment
def analyze_sentiment(comment):
    sentiment_dict = analyzer.polarity_scores(comment)
    return sentiment_dict['compound']

# Identify people based on predefined keywords
def find_people_in_comment(comment):
    words = word_tokenize(comment)
    mentioned_people = []

    grandma_keywords = ['ทวดมะลิ', 'แม่มะลิ', 'มะลิ', 'ทวด']
    father_keywords = ['โทนี่', 'พ่อ', 'พ่อโทนี่', 'พ่อโทนี', 'โทนี']
    mother_keywords = ['โจน่า', 'แม่', 'แม่โจน่า', 'แม่โจนา', 'โจนา']
    pig_keywords = ['หมู', 'เด้ง', 'น้องหมูเด้ง', 'น้อง', 'ฮิปโปตัวน้อย', 'ฮิบโปน้อย', 'ลูกฮิปโปแคระ', 'หลานหมูเด้ง', 'เหลนหมูเด้ง', 'เหลน', 'ลูกฮิปโป']
    caretaker_keywords = ['พี่เลี้ยง', 'คนดูแล', 'พี่เลี้ยงหมูเด้ง', 'พี่เลี้ยงผู้ดูแลหมูเด้ง', 'นายอรรถพล หนุนดี', 'คีปเปอร์', 'นายอรรถพล', 'อรรถพล']

    if any(keyword in words for keyword in grandma_keywords):
        mentioned_people.append('ทวดมะลิ')

    if any(keyword in words for keyword in father_keywords):
        mentioned_people.append('พ่อโทนี่')

    if any(keyword in words for keyword in mother_keywords):
        mentioned_people.append('แม่โจน่า')

    if any(keyword in words for keyword in pig_keywords):
        mentioned_people.append('หมูเด้ง')

    if any(keyword in words for keyword in caretaker_keywords):
        mentioned_people.append('พี่เลี้ยง')

    return list(set(mentioned_people))  # Remove duplicates

@app.route('/', methods=['GET'])
def test_api():
    return jsonify({'message': 'This page is for testing the API.'})

@app.route('/analyze', methods=['POST'])
def analyze_comments():
    # Use the Flask 'request' object directly
    data = request.json  # Ensure you're using Flask's request object

    video_url = data.get('url')

    if not video_url:
        return jsonify({'error': 'No URL provided'}), 400

    video_id = video_url.split('v=')[-1][:11]

    try:
        video_response = youtube.videos().list(part='snippet', id=video_id).execute()

        if not video_response['items']:
            return jsonify({'error': 'Video not found'}), 404

        uploader_channel_id = video_response['items'][0]['snippet']['channelId']

        comments = []
        nextPageToken = None

        # Fetch comments
        while True:
            request_comments = youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                maxResults=100,
                pageToken=nextPageToken
            )
            response = request_comments.execute()

            for item in response['items']:
                comment = item['snippet']['topLevelComment']['snippet']
                if comment['authorChannelId']['value'] != uploader_channel_id:
                    comments.append({
                        "author": comment['authorDisplayName'],
                        "text": comment['textDisplay']
                    })

            nextPageToken = response.get('nextPageToken')

            if not nextPageToken:
                break

        # Relevant comment filtering logic
        hyperlink_pattern = re.compile(
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        )
        threshold_ratio = 0.65
        relevant_comments = []

        for comment in comments:
            comment_text = comment['text'].lower().strip()

            emojis = emoji.emoji_count(comment_text)
            text_characters = len(re.sub(r'\s', '', comment_text))

            if (any(char.isalnum() for char in comment_text)) and not hyperlink_pattern.search(comment_text):
                if emojis == 0 or (text_characters / (text_characters + emojis)) > threshold_ratio:
                    relevant_comments.append(comment)

        results = []
        print("Analyzing Comments...")

        for comment in relevant_comments:
            comment_text = comment['text']
            sentiment_score = analyze_sentiment(comment_text)

            if sentiment_score > 0.05:
                sentiment_label = "Positive"
            elif sentiment_score < -0.05:
                sentiment_label = "Negative"
            else:
                sentiment_label = "Neutral"

            # Find mentioned people in the comment
            mentioned_people = find_people_in_comment(comment_text)

            results.append({
                "commenter": comment['author'],
                "comment": comment_text,
                "sentiment": sentiment_label,
                "sentiment_score": sentiment_score,
                "mentioned_people": mentioned_people or "None"
            })

        return jsonify({
            "total_comments": len(relevant_comments),
            "results": results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
