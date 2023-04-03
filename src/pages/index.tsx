import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { Button, Modal, Skeleton, notification } from "antd";
import { IconType } from "antd/es/notification/interface";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [paragraphs, setParagraphs] = useState<Array<string>>([]);
  const [paragraph, setParagraph] = useState<string>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getFrases();
  }, []);
  const getFrases = async () => {
    let frases: any = [];
    try {
      let fetching = await fetch("/api/get-frases");
      let fetched = await fetching.json();
      frases = fetched.message;
    } catch (error) {
      throw new Error("Ocorreu um erro em nossos servidores");
    }
    setParagraphs(frases);
    setParagraph(random(frases));
  };
  const random = (frases?: Array<string>) => {
    let rand: number = 0;
    if (frases) {
      rand = Math.floor(Math.random() * frases.length);
      return frases[rand];
    } else {
      rand = Math.floor(Math.random() * paragraphs.length);
      return paragraphs[rand];
    }
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

  const send = async () => {
    setLoading(true);
    try {
      if (paragraph) {
        fetch("/api/send-blacklist", {
          method: "POST",
          body: JSON.stringify({
            paragraph,
          }),
        })
          .then((data) => {
            setParagraphs((frases) => {
              frases.splice(0, frases.indexOf(paragraph));
              return frases;
            });
            setParagraph(random());

            setModalOpen(false);
            notificate(
              "Lamentamos pelo ocorrido!",
              "Nós agradecemos pela denúncia! Trocamos a mensagem para outra!"
            );
          })
          .catch((err) => {
            notificate(
              "Oops!",
              "Ocorreu um erro em nossos servidores! Sentimos muito por isso.",
              "error"
            );
          });
      } else {
        notificate(
          "Oops!",
          "Ocorreu um erro em nossos servidores! Sentimos muito por isso!.",
          "error"
        );
      }
    } catch (error) {
      notificate(
        "Oops!",
        "Ocorreu um erro em nossos servidores! Sentimos muito por isso.",
        "error"
      );
      throw new Error("Ocorreu um erro em nossos servidores");
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

        <div className={`${styles.center} ${styles.font}`}>
          {paragraph ?? <Skeleton.Input active={true} block />}
        </div>

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
