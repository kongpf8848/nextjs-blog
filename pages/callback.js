import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';

export async function getStaticProps() {
  const data={
    downloadLink: "https://baidu.com"
  }
  return {
    props: {
      data
    },
  }
}

const Home=(props)=> {
  return (
    <>
      <Head>
        <title>Test Page</title>
      </Head>
      <h1>The value of domain is: {process.env.DOMAIN}</h1>
      <a href={props.data.downloadLink} target="_blank">baidu</a>
      <Image
        src="/images/me.webp"
        width={400}
        height={400}
        alt="profile"
      />
    </>
  );
}

export default Home;
