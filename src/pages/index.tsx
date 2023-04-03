import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Modal, Rate, Row, Skeleton, notification } from "antd";
import { IconType } from "antd/es/notification/interface";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [paragraphs, setParagraphs] = useState<
    Array<{
      frase: string;
      stars: number;
      author: string;
    }>
  >([]);
  const [paragraph, setParagraph] = useState<{
    frase: string;
    stars: number;
    author: string;
  }>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [disableRate, setDisableRate] = useState<boolean>(false);
  const [valueRate, setValueRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const fraseRef = useRef<any>(null);
  useEffect(() => {
    getFrases();

    let timeout = setTimeout(() => {
      fraseRef?.current.scrollIntoView();
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);
  const getFrases = async () => {
    let frases: any = [];
    try {
      let fetching = await fetch("/api/get-frases");
      let fetched = await fetching.json();
      frases = fetched.message;
    } catch (error) {
      window.location.reload();
    }
    setParagraphs(frases);
    setParagraph(random(frases));
  };
  const random = (
    frases?: Array<{
      frase: string;
      stars: number;
      author: string;
    }>
  ) => {
    setDisableRate(false);
    let rand: number = 0;
    if (frases) {
      rand = Math.floor(Math.random() * frases.length);
      setValueRate(frases[rand].stars);
      return frases[rand];
    } else {
      rand = Math.floor(Math.random() * paragraphs.length);
      setValueRate(paragraphs[rand].stars);
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
            window.location.reload();

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
      window.location.reload();

      notificate(
        "Oops!",
        "Ocorreu um erro em nossos servidores! Sentimos muito por isso.",
        "error"
      );
      throw new Error("Ocorreu um erro em nossos servidores");
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(
      `${paragraph}\n\n*_Acesse nosso site para mais frases motivacionais!_* https://motiveme.online `
    );
    notificate("Prontinho!", "Você copiou a frase!");
  };
  const sendStar = async (value: number) => {
    setValueRate(value);
    setDisableRate(true);
    fetch("/api/send-star", {
      method: "POST",
      body: JSON.stringify({
        paragraph: paragraph?.frase,
        stars: value,
      }),
    })
      .then((data) => {
        notificate(
          "Star!",
          "Obrigado por compartilhar conosco esta avaliação!"
        );
      })
      .catch((err) => {
        notificate(
          "Error!",
          "Infelizmente ocorreu um erro ao compartilhar a avaliação!",
          "error"
        );
      });
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

        <div
          className={`${styles.center}`}
          ref={fraseRef}
          style={{
            textAlign: "center",
          }}
        >
          <Row justify={"center"} align={"middle"}>
            <Col span={24} className={styles.font}>
              {paragraph ? (
                `“${paragraph.frase}”`
              ) : (
                <Skeleton.Input active={true} block />
              )}
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              xl={12}
              xxl={12}
              className={styles.font}
              style={{
                marginTop: "1rem",
                fontSize: "20px",
              }}
            >
              {paragraph ? (
                ` Por ${paragraph.author}`
              ) : (
                <Skeleton.Input active={true} block />
              )}
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              xl={12}
              xxl={12}
              style={{
                marginTop: "1rem",
                backgroundColor: "white",
                padding: "6px",
                borderRadius: "16px",
              }}
            >
              {paragraph ? (
                <Rate
                  character={<HeartFilled />}
                  allowHalf
                  style={{
                    color: "red",
                  }}
                  value={valueRate}
                  disabled={disableRate}
                  onChange={sendStar}
                />
              ) : (
                <Skeleton.Input active={true} block />
              )}
            </Col>
          </Row>
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
          <a className={styles.card} onClick={() => copy()}>
            <h2 className={inter.className}>
              Copiar frase! <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Copie a frase motivacional!</p>
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
