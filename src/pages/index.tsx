import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { useEffect, useState } from "react";
import { Button, Modal, notification } from "antd";
import { IconType } from "antd/es/notification/interface";
const inter = Inter({ subsets: ["latin"] });

export default function Home({ frases }: { frases: Array<string> }) {
  const [paragraph, setParagraph] = useState<string>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    setParagraph(random());
  }, [frases]);

  const random = () => {
    const rand = Math.floor(Math.random() * frases.length);
    return frases[rand];
  };

  const notificate = (
    message: string,
    description: string,
    type: IconType = "success"
  ) => {
    notification.open({
      message,
      description,
      type: type,
    });
  };

  const getDoc = async (id: string) => {
    const doc = new GoogleSpreadsheet(id);
    await doc.useServiceAccountAuth({
      client_email: process.env.NEXT_PUBLIC_CLIENT_EMAIL ?? "",
      private_key: process.env.NEXT_PUBLIC_KEY
        ? process.env.NEXT_PUBLIC_KEY.replace(/\\n/g, "\n")
        : "",
    });
    await doc.loadInfo();
    return doc;
  };

  const send = async () => {
    setLoading(true);
    if (process.env.NEXT_PUBLIC_SHEET_ID_BLACKLIST !== undefined) {
      if (paragraph) {
        const blacklistDoc = await getDoc(
          process.env.NEXT_PUBLIC_SHEET_ID_BLACKLIST ?? ""
        );
        let sheet = blacklistDoc.sheetsByIndex[0];
        await sheet.addRow({
          blacklist: paragraph,
        });
        frases.splice(0, frases.indexOf(paragraph));
        setModalOpen(false);
        notificate(
          "Lamentamos pelo ocorrido!",
          "Nós agradecemos pela denúncia! Trocamos a mensagem para outra!"
        );
      } else {
        notificate(
          "Por favor preencha todos os campos!",
          "Preencha o campo para enviar a denúncia!",
          "error"
        );
      }
    } else {
      notificate(
        "Oops!",
        "Ocorreu um erro em nossos servidores! Sentimos muito por isso.",
        "error"
      );
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Frase motivacionais</title>
        <meta
          name="description"
          content="Uma frase motivacional para judar no seu dia!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.center}>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/logo.png"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={500}
              height={200}
              priority
            />
          </a>
        </div>

        <div className={`${styles.center} ${styles.font}`}>{paragraph}</div>

        <div className={styles.grid}>
          <a className={styles.card} onClick={() => setParagraph(random())}>
            <h2 className={inter.className}>
              Próxima frase <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Veja qual frase motivacional temos a mais!
            </p>
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSegnFeoN-r0c2t4jY_A-4L--QlY3K6SNM0OBSmSIxdzl6qN2Q/viewform?usp=sf_link"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Desejo contribuir <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Adicione uma frase!</p>
          </a>

          <a
            href="https://github.com/sponsors/DanielXavierJob"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Desejo doar <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Doe ajudando o desenvolvedor!</p>
          </a>
          <a className={styles.card} onClick={() => setModalOpen(true)}>
            <h2
              className={inter.className}
              style={{
                color: "red",
              }}
            >
              Frase obcena! <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Nos ajude denunciando!</p>
          </a>
        </div>
        <Modal
          title="Nós sentimos muito por isso!"
          open={modalOpen}
          onOk={() => {
            send();
          }}
          onCancel={() => setModalOpen(false)}
          footer={[
            <Button
              key="back"
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>,
            <Button
              key="send"
              onClick={() => {
                send();
              }}
              danger
              loading={loading}
            >
              Enviar denúncia
            </Button>,
          ]}
        >
          <p>Enviar essa mensagem para denúncia?</p>
        </Modal>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  let frases: Array<string> = [];
  if (
    process.env.NEXT_PUBLIC_KEY !== undefined &&
    process.env.NEXT_SHEET_ID !== undefined &&
    process.env.NEXT_PUBLIC_CLIENT_EMAIL !== undefined
  ) {
    const getDoc = async (id: string) => {
      const doc = new GoogleSpreadsheet(id);

      await doc.useServiceAccountAuth({
        client_email: process.env.NEXT_PUBLIC_CLIENT_EMAIL ?? "",
        private_key: process.env.NEXT_PUBLIC_KEY
          ? process.env.NEXT_PUBLIC_KEY.replace(/\\n/g, "\n")
          : "",
      });
      await doc.loadInfo();
      return doc;
    };
    const readRow = async () => {
      let sheet;
      let blacklist;
      const doc = await getDoc(process.env.NEXT_SHEET_ID ?? "");
      const blacklistDoc = await getDoc(
        process.env.NEXT_PUBLIC_SHEET_ID_BLACKLIST ?? ""
      );
      blacklist = blacklistDoc.sheetsByIndex[0];

      const rowsBlackList = await blacklist.getRows();

      sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();
      if (rows.length > 0) {
        rows.map((row) => {
          const frase = row;
          if (
            !rowsBlackList.find((bl) =>
              bl["blacklist"].includes(frase["Qual a frase?"])
            )
          ) {
            console.log(row.ativo);
            if (row.ativo === "1") {
              frases.push(row["Qual a frase?"]);
            } else if (row.ativo === undefined) {
              row.ativo = "1";
              row.save().then(() => {
                console.log("Dado atualizado!");
              });
              frases.push(row["Qual a frase?"]);
            }
          } else {
            row.ativo = 0;
            row.save().then(() => {
              console.log("Dado atualizado!");
            });
          }
        });
      } else {
        frases.push(
          "Oh, não possuímos nenhuma frase no momento, que tal você contribuir com uma frase motivacional?"
        );
      }
    };
    await readRow();
  } else {
    frases.push("Oh não conseguimos se conectar ao provedor de frases! :/");
  }

  if (frases.length === 0) {
    frases.push(
      "Oh, não possuímos nenhuma frase no momento, que tal você contribuir com uma frase motivacional?"
    );
  }
  return {
    props: {
      frases,
    },
  };
}
