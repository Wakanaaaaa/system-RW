import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/firebase";
import { shuffleArray } from "@/firestoreUtils.jsx";
import { generateRandomColor, useBackgroundColor } from "@/colorUtils.jsx";
// import { usePinchZoom } from "@/hooks/usePinchZoom.jsx";
import Link from "next/link";
import styles from "@/styles/word.module.css";
import { useEpisode } from "@/contexts/EpisodeContext";

export default function Word5() {
  const router = useRouter();
  const { episodeID, word1, word2, word3, word4, word5 } = router.query;
  const [keywords, setKeywords] = useState([]); // 空の配列を用意(ステート管理)
  const [colors, setColors] = useState([]); // カラー用のステート
  const { testerNumber } = router.query;
  // const { addToRefs } = usePinchZoom(testerNumber); // カスタムフックの利用
  const { episodeType } = useEpisode();

  useEffect(() => {
    const fetchDocumentsForWord1 = async () => {
      try {
        const subcollectionRef = collection(
          db,
          "4Wwords",
          testerNumber,
          episodeType
        );

        const subcollectionSnapshot = await getDocs(subcollectionRef);

        const allFieldsArray = [];
        const seenValues = new Set(); // 重複を防ぐためのセット

        // 全エピソードをチェック
        subcollectionSnapshot.forEach((doc) => {
          const data = doc.data();
          const docID = doc.id;

          const containsWord1 = Object.values(data).includes(word1);
          const containsWord2 = Object.values(data).includes(word2);
          const containsWord3 = Object.values(data).includes(word3);
          const containsWord4 = Object.values(data).includes(word4);
          const containsWord5 = Object.values(data).includes(word5);

          if (
            containsWord1 &&
            containsWord2 &&
            containsWord3 &&
            containsWord4 &&
            containsWord5
          ) {
            for (const [key, value] of Object.entries(data)) {
              if (
                key !== "do" &&
                key !== "createdAt" &&
                key !== "sentence" &&
                value !== word1 &&
                value !== word2 &&
                value !== word3 &&
                value !== word4 &&
                value !== word5 &&
                !seenValues.has(value)
              ) {
                allFieldsArray.push({
                  key,
                  value,
                  episodeID: docID,
                });
                seenValues.add(value); // 重複を防ぐためにセットに登録
                break;
              }
            }
          }
        });

        const shuffledArray = shuffleArray(allFieldsArray);
        const randomFields = shuffledArray.slice(0, 6);

        setKeywords(randomFields);
        const randomColors = randomFields.map(() => generateRandomColor());
        setColors(randomColors);
      } catch (error) {
        console.error("Error fetching subcollection documents: ", error);
      }
    };

    fetchDocumentsForWord1();
  }, [episodeID, word1, word2, word3, word4, word5, testerNumber, episodeType]);

  useBackgroundColor();

  return (
    <div>
      <div className={styles.selectedWordContainer}>
        <h3 className={styles.selectedWordText}>選択した単語：</h3>
        <div className={styles.selectedWordsList}>
          <span className={styles.selectedWordHighlight}>{word1}</span>
          <span className={styles.selectedWordHighlight}>{word2}</span>
          <span className={styles.selectedWordHighlight}>{word3}</span>
          <span className={styles.selectedWordHighlight}>{word4}</span>
          <span className={styles.selectedWordHighlight}>{word5}</span>
        </div>
      </div>

      <Link
        href={`/research/${testerNumber}/${episodeID}/${word1}/${word2}/${word3}/${word4}`}
      >
        <button className={styles.backButton}>戻る</button>
      </Link>
    </div>
  );
}
