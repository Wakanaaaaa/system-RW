import Link from "next/link";
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { SUBJECT_ID } from "@/subjectID";
import styles from "../styles/word.module.css";

export default function Word1() {
  const [keywords, setKeywords] = useState([]); // 空の配列を用意(ステート管理)
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const fetchAllDocuments = async () => {
      try {
        const subcollectionRef = collection(
          db,
          "4Wwords",
          SUBJECT_ID,
          "episodes"
        );
        const subcollectionSnapshot = await getDocs(subcollectionRef);

        // フィールドを一つの配列にまとめる
        const allFieldsArray = [];

        //Firestoreから取得したデータを一時的に格納し、後でステートに設定するための作業用配列
        subcollectionSnapshot.forEach((doc) => {
          const data = doc.data();
          const docID = doc.id; // ドキュメントIDを取得
          // console.log(doc.id);
          // ドキュメントのデータを配列に追加
          for (const [key, value] of Object.entries(data)) {
            allFieldsArray.push({ key, value, episodeID: docID });
          }
        });

        // 配列をシャッフルする関数
        const shuffleArray = (array) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        };

        // 配列をシャッフルし、最初の6個を取得
        const shuffledArray = shuffleArray(allFieldsArray);
        const randomFields = shuffledArray.slice(0, 6);

        // ステートを更新
        setKeywords(randomFields);

        const randomColors = randomFields.map(() => generateRandomColor());
        setColors(randomColors);
      } catch (error) {
        console.error("Error fetching subcollection documents: ", error);
      }
    };

    fetchAllDocuments();
  }, []);

  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div>
      {/* keywordsの内容を画面に表示 */}
      {/* <h3>firebaseからのキーワード:</h3> */}
      <ul>
        {keywords.map((item, index) => (
          <ol key={index}>
            <Link href={{ pathname:`/${item.episodeID}/${item.value}`,query: { color: colors[index] }, }}>
              <button
                className={styles.button}
                style={{ borderColor: colors[index] }}
              >
                {item.value}
              </button>
            </Link>
          </ol>
        ))}
      </ul>
    </div>
  );
}
