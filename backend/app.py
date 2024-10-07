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

# Helper functions
def analyze_sentiment(comment):
    sentiment_dict = analyzer.polarity_scores(comment)
    return sentiment_dict['compound']

def text_process(text):
    # Convert the input to a string to ensure it's iterable
    text = str(text)
    final = "".join(u for u in text if u not in ("?", ".", ";", ":", "!", '"', "ๆ", "ฯ"))
    final = word_tokenize(final)
    final = " ".join(word for word in final)
    final = " ".join(word for word in final.split()
                     if word.lower() not in thai_stopwords)  # Call lower() method
    return final

def sentiment_scores(comment):
    sentiment_object = SentimentIntensityAnalyzer()
    sentiment_dict = sentiment_object.polarity_scores(comment)
    return sentiment_dict['compound']

def analyze_comments_from_file(file_path):
    polarity = []
    positive_comments = []
    negative_comments = []
    neutral_comments = []

    with open(file_path, 'r', encoding='utf-8') as f:
        comments = f.readlines()

    print("Analyzing Comments...")
    for item in comments:
        score = sentiment_scores(item)
        polarity.append(score)

        if score > 0.05:
            positive_comments.append(item.strip())
        elif score < -0.05:
            negative_comments.append(item.strip())
        else:
            neutral_comments.append(item.strip())

    avg_polarity = sum(polarity) / len(polarity) if polarity else 0
    response_type = (
        "Positive response" if avg_polarity > 0.05
        else "Negative response" if avg_polarity < -0.05
        else "Neutral response"
    )

    most_positive_comment = comments[polarity.index(max(polarity))] if polarity else "N/A"
    most_negative_comment = comments[polarity.index(min(polarity))] if polarity else "N/A"

    return polarity, positive_comments, negative_comments, neutral_comments, avg_polarity, response_type, most_positive_comment, most_negative_comment


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
            request_comments = youtube.commentThreads().list(  # Rename to avoid conflict
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
                    relevant_comments.append(comment_text)

        # Save relevant comments to a text file
        with open("ytcomments.txt", 'w', encoding='utf-8') as f:
            for comment in relevant_comments:
                f.write(f"{comment}\n")

        print("Comments stored successfully!")

        # Analyze sentiment for the comments read from the file
        (
            polarity, positive_comments, negative_comments,
            neutral_comments, avg_polarity, response_type,
            most_positive_comment, most_negative_comment
        ) = analyze_comments_from_file("ytcomments.txt")

        # Prepare results
        sentiment_results = {
            "average_polarity": avg_polarity,
            "response_type": response_type,
            "most_positive_comment": most_positive_comment.strip(),
            "most_negative_comment": most_negative_comment.strip(),
            "positive_comments": positive_comments,
            "negative_comments": negative_comments,
            "neutral_comments": neutral_comments,
            "total_comments": len(relevant_comments)
        }

        return jsonify(sentiment_results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
