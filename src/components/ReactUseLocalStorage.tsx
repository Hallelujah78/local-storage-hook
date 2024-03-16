import useLocalStorage from "../hooks/useLocalStorageReactUse";
import styled from "styled-components";

const ReactUseLocalStorage = () => {
  const [value, setValue, remove] = useLocalStorage("myString", "foo");
  return (
    <Wrapper>
      <div>Value: {value}</div>
      <button onClick={() => setValue("bar")}>bar</button>
      <button onClick={() => setValue("baz")}>baz</button>
      <button onClick={() => remove()}>Remove</button>
      <p>
        This uses the useLocalStorage hook from react-use. Let's dig into how
        this works and hopefully learn something!
      </p>
      <p>
        First off, we see that we import `Dispatch` and `SetStateAction` from
        React. These are required when setting types for custom hooks involving
        state. A great writeup{" "}
        <a href="https://kentcdodds.com/blog/wrapping-react-use-state-with-type-script">
          here
        </a>{" "}
        by Kent C Dodds.
      </p>
      <p>After that, we declare a parserOptions type:</p>
    </Wrapper>
  );
};

export default ReactUseLocalStorage;

const Wrapper = styled.div``;
