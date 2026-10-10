import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score

def train_and_save():
    print("Building comprehensive training dataset for TruthLens...")

    # Broad, realistic dataset across multiple categories (Label: 0 = Real, 1 = Fake)
    data = [
        # =========================================================================
        # REAL NEWS SAMPLES (Label: 0)
        # =========================================================================
        # Science & Astronomy
        ("NASA scientists confirm evidence of flowing liquid water on Mars surface via spectral analysis.", 0),
        ("ISRO successfully landed Chandrayaan-3 near the lunar south pole, making India the first nation to achieve this feat.", 0),
        ("NASA James Webb Space Telescope captures deepest sharp infrared image of the distant early universe.", 0),
        ("ISRO successfully launches Aditya-L1 spacecraft to study the Sun from Lagrange point 1.", 0),
        ("European Space Agency launches Euclid space telescope to investigate dark matter and dark energy in the cosmos.", 0),
        ("Astronomers discover Earth-sized exoplanet orbiting within the habitable zone of a nearby red dwarf star.", 0),
        ("CERN physicists observe rare Higgs boson decay into a Z boson and a photon at Large Hadron Collider.", 0),
        ("DeepMind AlphaFold model predicts 3D structures for over 200 million cataloged proteins.", 0),
        ("Astronomers detect gravitational waves from neutron star collision using LIGO detectors.", 0),
        ("Supercomputer simulation unveils complex fluid dynamics inside solar flares during coronal mass ejections.", 0),

        # Health & Medicine
        ("World Health Organization published updated guidelines on cardiovascular health and sodium intake.", 0),
        ("Researchers engineered an enzyme capable of breaking down PET plastic bottles six times faster.", 0),
        ("MIT researchers use artificial intelligence to discover a potent new antibiotic compound named Halicin.", 0),
        ("World Health Organization declares successful eradication of wild poliovirus in another region.", 0),
        ("Clinical trial published in The Lancet demonstrates efficacy of new malaria vaccine.", 0),
        ("FDA grants full regulatory approval for new Alzheimer's disease treatment after phase 3 trials.", 0),
        ("Medical researchers develop mRNA cancer vaccine showing promising results in melanoma patients.", 0),
        ("National Institutes of Health study finds regular walking reduces risk of heart disease and stroke.", 0),
        ("Oxford researchers complete clinical trial testing targeted gene therapy for rare inherited blindness.", 0),
        ("Global study confirms vaccination significantly reduces severe complications from seasonal influenza.", 0),

        # Environment & Earth
        ("Global sea levels are rising at an accelerated pace due to ice sheet loss in Antarctica and Greenland.", 0),
        ("Marine biologists discover deep-sea coral reef ecosystem thriving near Galápagos Islands.", 0),
        ("Solar panel efficiency reaches record 33 percent using perovskite silicon tandem solar cell technology.", 0),
        ("Electric vehicle battery technology advances with solid-state chemistry offering double energy density.", 0),
        ("World Meteorological Organization confirms past decade was the warmest on instrumental record.", 0),
        ("UN Climate Summit delegates reach consensus on global clean energy transition goals.", 0),
        ("Environmental scientists report partial recovery of Earth's protective ozone layer.", 0),
        ("Geologists record 6.2 magnitude earthquake off the coast of Japan with no tsunami threat.", 0),

        # Politics, Economics & Government
        ("Federal Reserve announced an adjustment in interest rates following quarterly inflation data.", 0),
        ("Reserve Bank of India maintains repo rate at 6.5 percent in monetary policy committee review.", 0),
        ("French government announced green energy subsidies to cut carbon emissions significantly by 2030.", 0),
        ("Archaeologists in Tamil Nadu unearthed 2600-year-old ancient artifacts at the Keeladi excavation site.", 0),
        ("Kochi Metro rail expansion second phase officially approved by transport authority to reduce urban congestion.", 0),
        ("Election Commission of India announces dates for nationwide parliamentary general elections.", 0),
        ("Supreme Court of India delivers verdict upholding environmental protection standards in coastal zones.", 0),
        ("European Union approves landmark legislation regulating artificial intelligence applications.", 0),
        ("Finance Minister presents annual union budget focusing on infrastructure and digital public goods.", 0),
        ("United Nations General Assembly adopts resolution urging peaceful resolution to regional conflict.", 0),
        ("Prime Minister inaugurates new international airport terminal built to boost regional connectivity.", 0),
        ("Indian Space Research Organisation collaborates with international agencies for Earth observation satellite NISAR.", 0),

        # Technology & Society
        ("Tech companies release open source artificial intelligence models for academic research.", 0),
        ("Cybersecurity agencies issue alert advising public to patch newly identified browser vulnerability.", 0),
        ("Telecommunications ministry expands rural optical fiber network to connect ten thousand villages.", 0),
        ("High-speed railway corridor completes trial run between major industrial cities.", 0),
        ("Stock market indices close higher led by gains in banking and technology sectors.", 0),

        # =========================================================================
        # FAKE NEWS SAMPLES (Label: 1)
        # =========================================================================
        # Sensational Science & Space Hoaxes
        ("NASA confirms Earth will enter 15 days of total complete darkness in December due to alignment!", 1),
        ("NASA confirms Earth will experience 6 days of total darkness this month, scientists panic!", 1),
        ("Scientists find moon is made of green cheese under thin layer of lunar dust according to leaked report!", 1),
        ("Secret underground city found under Antarctic ice sheet harboring living dinosaurs and mammoths!", 1),
        ("Aliens officially landed in desert and signed secret treaty with world leaders behind closed doors!", 1),
        ("Shocking discovery! Giant 50-foot skeleton of ancient human giant excavated in Himalayas!", 1),
        ("James Webb telescope captures image of giant glowing angel floating in deep space!", 1),
        ("Astronomers confirm mystery planet Nibiru is hurtling directly towards Earth to destroy civilization next week!", 1),
        ("Archaeologists discover Plato lost city of Atlantis in Sahara desert matching circular golden temple descriptions!", 1),
        ("Mermaid creature washed ashore on beach in Florida caught on camera alive by tourists!", 1),

        # Health, Medical & Miracle Cure Hoaxes
        ("Drinking boiled lemon water and garlic cures all cancers and kills cancer cells completely overnight!", 1),
        ("Miracle pill discovered by small university scientist completely stops human aging overnight!", 1),
        ("Drinking warm water with lemon and baking soda eliminates coronavirus in 24 hours guaranteed!", 1),
        ("Big Pharma hiding simple plant seed that cures diabetes and restores pancreas in 3 days!", 1),
        ("Banana peels contain rare chemical that grants instant night vision when consumed daily!", 1),
        ("Eating raw onion slices on feet draws out all toxins and poisons from body while sleeping!", 1),
        ("Doctors stunned! Rubbing banana peel on forehead cures chronic migraines permanently!", 1),
        ("Secret herbal concoction dissolves all kidney stones in 1 hour without any surgery!", 1),
        ("Drinking kerosene in small drops cures stomach ulcers and cleanses internal organs completely!", 1),
        ("Turmeric mixed with honey is 1000 times stronger than chemotherapy according to leaked study!", 1),

        # Conspiracies & Tech Scams
        ("Leaked documents confirm 5G towers broadcast frequencies that suppress human immune systems globally!", 1),
        ("Secret government agency installing microchips in tap water supply to control human thoughts!", 1),
        ("Cell phone vibrations cause permanent magnetic distortion in brain tissue according to viral message!", 1),
        ("Vaccines contain microscopic nano-robots designed to alter human DNA and track locations!", 1),
        ("Secret meeting between central banks reveals plan to replace US Dollar with Bitcoin next month!", 1),
        ("Government installing cameras inside household electric meters to spy on citizens in their bedrooms!", 1),
        ("Forward this message to 10 WhatsApp groups or your account will be deleted permanently tonight!", 1),
        ("Click this official link to get free 500GB 5G high speed internet data recharge instantly!", 1),
        ("Reserve Bank giving 10000 rupees to everyone who shares this message on social media!", 1),
        ("Government announces 15 lakh rupees will be deposited into every citizen bank account immediately!", 1),

        # Political & Celebrity Death Hoaxes
        ("Pope Francis arrested on charges of child trafficking and conspiracy in Vatican secret raid!", 1),
        ("Government banning all paper currency notes by midnight tonight, mandatory digital chip required!", 1),
        ("Breaking news: Beloved actor Jackie Chan tragically died in horrific car accident this morning!", 1),
        ("Prime Minister signs secret executive order abolishing all income taxes starting tomorrow morning!", 1),
        ("Martial law declared across entire country, army taking over civil administration tonight!", 1),
        ("United Nations forces secretly deployed inside nation to seize private citizen vehicles!", 1),
        ("All banks declared bankrupt and closing permanently from Monday morning, withdraw cash immediately!", 1),
        ("Famous world leader caught fleeing country with gold bars packed in military cargo plane!", 1),
        ("Supreme Court cancels all property ownership and nationalizes all private apartments!", 1),
        ("WhatsApp will start charging monthly subscription fee unless you forward this alert to 20 contacts!", 1)
    ]

    # Create DataFrame
    df = pd.DataFrame(data, columns=['text', 'label'])

    # Augment data with linguistic variations for high generalization
    augmented_data = []
    for idx, row in df.iterrows():
        text = row['text']
        label = row['label']
        augmented_data.append({'text': text, 'label': label})
        augmented_data.append({'text': text.lower(), 'label': label})
        augmented_data.append({'text': f"BREAKING: {text}", 'label': label})
        augmented_data.append({'text': f"News Alert: {text}", 'label': label})
        if label == 1:
            augmented_data.append({'text': f"SHOCKING ALERT! {text} MUST READ!", 'label': label})
            augmented_data.append({'text': f"{text} Share before it gets deleted!", 'label': label})
            augmented_data.append({'text': f"URGENT: {text} Forward to all your family and friends!", 'label': label})
            augmented_data.append({'text': f"Unbelievable discovery! {text}", 'label': label})
            augmented_data.append({'text': f"100% Proven! {text}", 'label': label})
        else:
            augmented_data.append({'text': f"Official Press Release: {text}", 'label': label})
            augmented_data.append({'text': f"According to verified reports, {text.lower()}", 'label': label})
            augmented_data.append({'text': f"Published report: {text}", 'label': label})

    aug_df = pd.DataFrame(augmented_data)
    print(f"Total training samples created: {len(aug_df)}")

    # Feature extraction with TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=8000,
        sublinear_tf=True,
        min_df=1
    )
    X = vectorizer.fit_transform(aug_df['text'])
    y = aug_df['label']

    # Train Calibrated Logistic Regression Model
    base_model = LogisticRegression(C=1.5, max_iter=1000, class_weight='balanced')
    model = CalibratedClassifierCV(base_model, cv=3)
    model.fit(X, y)

    # Evaluate Accuracy
    preds = model.predict(X)
    acc = accuracy_score(y, preds)
    print(f"Model Training Accuracy: {acc * 100:.2f}%")

    # Destination directory
    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(model_dir, exist_ok=True)

    # Save model and vectorizer
    model_path = os.path.join(model_dir, "fake_news_model.pkl")
    vectorizer_path = os.path.join(model_dir, "tfidf_vectorizer.pkl")

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    print(f"Successfully saved model to: {os.path.abspath(model_path)}")
    print(f"Successfully saved vectorizer to: {os.path.abspath(vectorizer_path)}")

if __name__ == "__main__":
    train_and_save()
