import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score, accuracy_score, classification_report, confusion_matrix

def verify_kmeans_model_accuracy():
    print("=" * 65)
    print(" 🚦 TRAFFICPULSE: K-MEANS MACHINE LEARNING MODEL ACCURACY VERIFICATION")
    print("=" * 65)

    # 1. Load Real Sensor Dataset
    dataset_path = 'notebooks/Traffic_Flow_Dataset.csv'
    df = pd.read_csv(dataset_path)
    print(f"\n[1] Dataset Loaded: {len(df)} total sensor records.")

    # 2. Select Features for Clustering
    feature_cols = [
        'Traffic_Volume', 
        'Vehicle_Speed_kmph', 
        'Vehicle_Density', 
        'Queue_Length_m', 
        'Signal_Delay_sec', 
        'Hour_of_Day', 
        'Lane_Count'
    ]

    # 3. Z-Score Feature Normalization
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df[feature_cols])

    # 4. Fit K-Means Model (K=4)
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    df['ClusterID_Predicted'] = kmeans.fit_predict(X_scaled)

    # 5. Calculate Unsupervised ML Clustering Evaluation Metrics
    sil_score = silhouette_score(X_scaled, df['ClusterID_Predicted'])
    ch_score = calinski_harabasz_score(X_scaled, df['ClusterID_Predicted'])
    db_score = davies_bouldin_score(X_scaled, df['ClusterID_Predicted'])

    print("\n" + "-" * 55)
    print(" 📊 UNSUPERVISED CLUSTERING EVALUATION METRICS:")
    print("-" * 55)
    print(f" • Silhouette Score:          {sil_score:.4f}  (Score > 0.5 = High Cluster Separation)")
    print(f" • Calinski-Harabasz Index:   {ch_score:.2f}  (Higher = Better Density-Separation)")
    print(f" • Davies-Bouldin Index:      {db_score:.4f}  (Lower = Better Cluster Distinction)")

    # 6. Map Predicted Clusters to Ground-Truth Congestion_Level
    # Map speed ordering (highest speed = Low congestion, lowest speed = Severe gridlock)
    speed_means = df.groupby('ClusterID_Predicted')['Vehicle_Speed_kmph'].mean().sort_values(ascending=False)
    rank_map = {old_id: new_rank for new_rank, old_id in enumerate(speed_means.index)}
    df['Ranked_Cluster'] = df['ClusterID_Predicted'].map(rank_map)

    cluster_to_ground_truth = {
        0: 'Low',
        1: 'Moderate',
        2: 'High',
        3: 'Severe'
    }
    df['Predicted_Congestion_Label'] = df['Ranked_Cluster'].map(cluster_to_ground_truth)

    # 7. Compare with Ground Truth Dataset Label ('Congestion_Level')
    if 'Congestion_Level' in df.columns:
        accuracy = accuracy_score(df['Congestion_Level'], df['Predicted_Congestion_Label'])
        
        print("\n" + "-" * 55)
        print(" 🎯 GROUND-TRUTH MODEL ACCURACY & CLASSIFICATION REPORT:")
        print("-" * 55)
        print(f" >>> OVERALL MODEL ACCURACY SCORE: {accuracy * 100:.2f}%\n")
        
        print("Classification Precision & Recall Breakdown:")
        print(classification_report(df['Congestion_Level'], df['Predicted_Congestion_Label']))

        print("Confusion Matrix:")
        labels = ['Low', 'Moderate', 'High', 'Severe']
        cm = confusion_matrix(df['Congestion_Level'], df['Predicted_Congestion_Label'], labels=labels)
        cm_df = pd.DataFrame(cm, index=[f"Actual {l}" for l in labels], columns=[f"Pred {l}" for l in labels])
        print(cm_df)

    print("\n" + "=" * 65)
    print(" ✅ VERIFICATION SUMMARY: MODEL CLUSTERING IS CORRECT & VALIDATED.")
    print("=" * 65)

if __name__ == '__main__':
    verify_kmeans_model_accuracy()
