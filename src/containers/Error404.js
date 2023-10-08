import { useEffect, useState } from 'react';
import confused from '../assets/images/confused.webp';
import { useWindowSize } from '../lib/hooks';
import Header from './Header';

const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  container: {
    padding: 50,
    flex: 1,
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    backgroundImage: `url(${confused})`,
    backgroundSize: 'auto 100%',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  body: {
    maxWidth: 300,
  },
  text404: {
    fontSize: '7rem',
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    textShadow:
      `0 1px 0 #ccc,
      0 2px 0 #c9c9c9,
      0 3px 0 #bbb,
      0 4px 0 #b9b9b9,
      0 5px 0 #aaa,
      0 6px 1px rgba(0,0,0,.1),
      0 0 5px rgba(0,0,0,.1),
      0 1px 3px rgba(0,0,0,.3),
      0 3px 5px rgba(0,0,0,.2),
      0 5px 10px rgba(0,0,0,.25),
      0 10px 10px rgba(0,0,0,.2),
      0 20px 20px rgba(0,0,0,.15)`,
  },
  credit: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    fontSize: '0.8rem',
  },
};

const Error404 = () => {
  const [paddingLeft, setPaddingLeft] = useState(300);
  const size = useWindowSize();

  useEffect(() => {
    setPaddingLeft(size.width < 576 ? 100 : 300);
  }, [size, setPaddingLeft]);

  return (
    <div style={styles.page}>
      <Header />
      <main style={styles.container}>
        <div style={{ ...styles.content, paddingLeft }}>
          <div style={styles.body}>
            <p className="block-text" style={styles.text404}>404</p>
            <p>Hmmm ...</p>
            <p>Looks like you found a page that does not exist.</p>
            <p>We are as lost as you are!</p>
          </div>
          <div style={styles.credit}>
            <span>Illustration By </span>
            <a
              href="https://www.vecteezy.com/free-vector/question-mark"
              target="_blank"
              rel="noreferrer"
            >
              Vecteezy
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Error404;
