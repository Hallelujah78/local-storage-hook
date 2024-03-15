import { useRef, useState, useEffect } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import styled from "styled-components";

const App: React.FC = () => {
  const { getLocalStorage, setLocalStorage } = useLocalStorage();
  const [string, setString] = useState<string | null>("");
  const [secondString, setSecondString] = useState<string>(() => {
    return localStorage.getItem("secondString") || "";
  });
  const [thirdString, setThirdString] = useState<string>(() => {
    return getLocalStorage("thirdString");
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (inputRef.current) {
      // string
      setString(inputRef.current.value);
      localStorage.setItem("string", inputRef.current.value);
      // secondString
      setSecondString(inputRef.current.value);
      localStorage.setItem("secondString", inputRef.current.value);
      // thirdString
      setThirdString(inputRef.current.value);
      setLocalStorage("thirdString", inputRef.current.value);
      // reset input
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    const localStore = localStorage.getItem("string");

    if (localStore) {
      setString(localStore);
    } else {
      localStorage.setItem("string", "");
    }
  }, []);

  return (
    <Wrapper>
      <nav>
        <h1>Exploring local storage</h1>
      </nav>
      <section>
        <input ref={inputRef} type="text" />
        <button onClick={handleClick}>Submit</button>

        <h1 className="string-value:">value 1: {string}</h1>
        <h1 className="string-value:">value 2: {secondString}</h1>
        <p>
          Value 1 is initialized from local storage using a useEffect. If you
          refresh the page, there is a flash as the page is rendered and then
          rerendered.
        </p>
        <p>
          Value 2 is initialized from local storage using a callback in the
          useState. If you refresh the page, there is no flash.
        </p>
        <h1 className="string-value:">value 3: {thirdString}</h1>
      </section>
    </Wrapper>
  );
};

export default App;

const Wrapper = styled.div`
  height: 100vh;
  position: relative;
  nav {
    border-bottom: 1px solid gray;
    text-align: center;
    height: fit-content;
    padding: 0.5rem 0 0.5rem 0;
  }
  h1 {
    text-align: center;
    font-size: calc(1.75rem + 0.390625vw);
    margin: 0.5rem 0 0.5rem 0;
  }
  section {
    display: grid;
    place-content: center;
    max-width: 100%;
    height: calc(50vh - 3rem);
    input {
    }

    button {
      margin-bottom: 3rem;
    }
    p {
      font-size: calc(1rem + 0.390625vw);
      margin: 0.5rem 0 0.5rem 0;
    }
    .string-value,
    .string-value-two {
      margin-top: 2rem;
    }
  }
`;
