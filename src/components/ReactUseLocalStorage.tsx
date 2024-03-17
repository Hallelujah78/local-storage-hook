import useLocalStorage from "../hooks/useLocalStorageReactUse";
import styled from "styled-components";
import { CodeBlock, a11yDark, Code } from "react-code-blocks";

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
        First off, we see that we import{" "}
        <Code text={`Dispatch`} theme={a11yDark} language="js" /> and
        `SetStateAction` from React. These are required when setting types for
        custom hooks involving state. A great writeup{" "}
        <a href="https://kentcdodds.com/blog/wrapping-react-use-state-with-type-script">
          here
        </a>{" "}
        by Kent C Dodds.
      </p>
      <p>After that, we declare a parserOptions type:</p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`type parserOptions<T> =
  | {
      raw: true;
    }
  | {
      raw: false;
      serializer: (value: T) => string;
      deserializer: (value: string) => T;
    };`}
          language={"typescript"}
          theme={a11yDark}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        JSON.parse and stringify do not handle all data types that can be
        present in an object in JavaScript. For example, functions, regular
        expressions, and undefined values cannot be serialized, and will
        therefore be lost during the serialization process. When the object is
        deserialized with JSON.parse(), any methods or functions attached to the
        original object will be lost, and undefined values will be converted to
        null.
      </p>
      <p>Next, we start the declaration of the useLocalStorage hook:</p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`const useLocalStorage = <T>(
  key: string,
  initialValue?: T,
  options?: parserOptions<T>
): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => void] => {
  if (!isBrowser) {
    return [initialValue as T, noop, noop];
  }
  if (!key) {
    throw new Error("useLocalStorage key may not be falsy");
  }`}
          language={"typescript"}
          theme={a11yDark}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        We see we are using generics with useLocalStorage which is an arrow
        function. We are passing in a generic type of T. The function takes a
        key, optional intialValue, and optional options paramaters.
      </p>
      <p>
        The hook returns an array, or actually a tuple (?) where the first
        element is of type T or undefined, the second element is a state setter
        which takes parameters of type T or undefined, and the final parameter
        is a function that takes no params and returns nothing.
      </p>
      <p>
        Next we check isBrowser (which is imported from a util file in
        react-use). If isBrowser is false, we return our array as [initialValue
        as T, noop, noop]. So we are returning the initialValue cast to its
        original type, a noop function (also from react-use), which is a
        function that does nothing. This makes some sense, as if we are not in a
        browser environment then there is no local storage. We also throw an
        error if the key is null, since it is required.
      </p>
      <p>
        Next, we initialize the deserializer. From Wikipedia: In computing,
        serialization is the process of translating a data structure or object
        state into a format that can be stored or transmitted and reconstructed
        later. If we have provided parser options and raw is true, then the
        deserializer is set to an anonymous function that takes a value of
        unknown type and returns that value. It appears to do nothing to the
        input. If raw is false, then serializer and deserializer must have
        values - this is how the parserOptions type is set up - and we set the
        deserializer to options.deserializer. Note, if options is false then the
        deserializer defaults to JSON.parse.
      </p>
      <p>
        Example of custom deserialization can be found{" "}
        <a href="https://eduardoboucas.com/posts/2020-02-04-custom-json-serialisation-deserialisation/">
          here.
        </a>{" "}
        For example, JSON.stringify can't serialize a regular expression:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`var original = {
  email: /^j(ohn){0,1}(.){0,1}doe@example.com$/,
  name: 'John Doe',
  yearOfBirth: 1988
}

console.log(JSON.stringify(original));
\\\\ output: "{"email":{},"name":"John Doe","yearOfBirth":1988}" `}
          language={"js"}
          theme={a11yDark}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        As you can see, email is just an empty object. Let's imagine we have a
        regular expression, /foo/i, and we choose to represent it like this:{" "}
        <Code
          text={`["<<REGEX", "/foo/i", "REGEX>>"].`}
          theme={a11yDark}
          language="js"
        />{" "}
        Since this is an array of strings, we can serialize it. To deserialize
        it, the deserializer needs to understand that an array of 3 strings in
        this format must be treated a particular way. The serializer:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`function serializer(key, value) {
  if (value instanceof RegExp) {
    return ['<<REGEXP', value.toString(), 'REGEXP>>']
  }
  return value
}`}
          language={"js"}
          theme={a11yDark}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        This makes sense. In our 'original' example, original.email is an
        instance of RegExp and so we return the array in the format our
        deserializer is looking out for. The deserializer:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`function deserialize(key, value) {
  if (
    Array.isArray(value) &&
    value.length === 3 &&
    value[0] === '<<REGEXP' &&
    value[2] === 'REGEXP>>'
  ) {
    let [, exp, flags] = value[1].match(/(.*)/(.*)?/)
    return new RegExp(exp, flags || '')
  }
  return value
};
var serialized = JSON.stringify(original, serializer)
var deserialized = JSON.parse(serialized, deserialize)`}
          language={"js"}
          theme={a11yDark}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        Note how stringify can take a custom serialisation method, which
        specifies the format and shape with which a value is serialised.
        Similarly for parse, we can supply a custom deserializer function.
      </p>
      <p>
        After that serialization/deserialization tangent, let's continue
        exploring useLocalStorage. Next, we have an initializer which appears to
        be a function wrapped in useRef. This may take some unravelling.
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`const initializer = useRef((key: string) => {
  try {
    const serializer = options
      ? options.raw
        ? String
        : options.serializer
      : JSON.stringify;

    const localStorageValue = localStorage.getItem(key);
    if (localStorageValue !== null) {
      return deserializer(localStorageValue);
    } else {
      initialValue && localStorage.setItem(key, serializer(initialValue));
      return initialValue;
    }
  } catch {
    // If user is in private mode or has storage restriction
    // localStorage can throw. JSON.parse and JSON.stringify
    // can throw, too.
    return initialValue;
  }
});`}
          language={"js"}
          theme={a11yDark}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      ;
    </Wrapper>
  );
};
// ""
export default ReactUseLocalStorage;

const Wrapper = styled.div`
  .code-block-wrapper {
    margin: 2rem 0 2rem 0;
  }
  p {
    margin: 1rem 0 1rem 0;
  }
`;

//  <Code text={`Dispatch`} theme={a11yDark} language="js" />

//  <div
//    className="code-block-wrapper"
//    style={{
//      fontFamily: "Fira Code",
//      fontSize: "calc(0.90rem + 0.390625vw)",
//    }}
//  >
//    <CodeBlock
//      text={``}
//      language={"js"}
//      theme={a11yDark}
//      showLineNumbers={false}
//      wrapLongLines={true}
//    />
//  </div>;
