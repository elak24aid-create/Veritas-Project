import nltk

def setup():
    print("Pre-downloading NLTK data...")
    nltk.download('punkt')
    nltk.download('punkt_tab')
    nltk.download('averaged_perceptron_tagger')
    nltk.download('brown')
    nltk.download('wordnet')
    print("NLTK data setup complete.")

if __name__ == "__main__":
    setup()
