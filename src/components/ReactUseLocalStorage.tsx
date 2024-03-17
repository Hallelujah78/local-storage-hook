import useLocalStorage from "../hooks/useLocalStorageReactUse";
import styled from "styled-components";
import { CodeBlock, Code, dracula } from "react-code-blocks";

const ReactUseLocalStorage = () => {
  const [value, setValue, remove] = useLocalStorage("storageLimit", "foo");
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
        <Code text={`Dispatch`} theme={dracula} language="js" /> and
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
          theme={dracula}
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
  }
  ...}`}
          language={"typescript"}
          theme={dracula}
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
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        As you can see, email is just an empty object. Let's imagine we have a
        regular expression, /foo/i, and we choose to represent it like this:{" "}
        <Code
          text={`["<<REGEX", "/foo/i", "REGEX>>"].`}
          theme={dracula}
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
          theme={dracula}
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
          theme={dracula}
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
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        Reminder: useRef is used to create a mutable reference to an element or
        value. It does not trigger a re-render. Commonly used to access and
        manage DOM elments directly, storing persistent values, or working with
        values that should not trigger a re-render. Storing previous values:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`import React, { useEffect, useRef } from "react";

const PreviousValueComponent = ({ value }) => {
  const prevValueRef = useRef();

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  return (
    <div>
      <p>Current Value: {value}</p>
      <p>Previous Value: {prevValueRef.current}</p>
    </div>
  );
};`}
          language={"jsx"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        Note how when the value is updated, the prevValueRef.current gets
        updated inside the useEffect. Use useRef only when you need to manage a
        mutable value or reference that should not affect the component's
        rendering. Advanced examples of using useRef can be found{" "}
        <a href="https://medium.com/@zahidbashirkhan/react-useref-use-cases-with-examples-d7680d48a6e1#:~:text=Conclusion,without%20triggering%20unnecessary%20re%2Drenders.">
          here
        </a>
        , including using useImperativeHandle with ref and forwardRef to provide
        a more controlled and explicit way of interacting with a child
        component's methods or properties from its parent.
      </p>
      <p>
        Back to our useLocalStorage hook, we can say that we are using useRef
        here because we want initialize to refer to a persistent value and we
        don't want to trigger re-renders. Beyond that, I'll have to figure it
        out later!
      </p>
      <p>
        We are wrapping a bunch of code in a try-catch block. We set our
        'serializer.' If options is true and options.raw is true, then our
        serializer is 'String.' String here is the constructor method for
        strings, something that I have never used. Interesting points about the
        String constructor:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`let str1 = new String('What am I?');
typeof str1; // 'object'

let str2 = String('What am I?');
typeof str2; // 'string'`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        When a string is initialized with the new keyword, it is an object. When
        used without new, like with str2 above, it is of type string. I'll take
        a wild guess that since we are serializing something, we won't be using
        String with the new keyword later in our custom hook.
      </p>
      <p>
        As with our deserializer, if options.raw is false, we use the custom
        serializer, options.serializer. If options is false, we default to using
        JSON.stringify. Still inside our try block:
      </p>

      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`const localStorageValue = localStorage.getItem(key);
if (localStorageValue !== null) {
  return deserializer(localStorageValue);
} else {
  initialValue && localStorage.setItem(key, serializer(initialValue));
  return initialValue;
}`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        We get the local storage item in localStorage via the key passed to our
        hook. If it exists, we return the deserialized value. Otherwise, if
        initialValue is truthy, we set the local storage value using the key,
        initialValue and the serializer. Looking at the catch block, we return
        the initialValue. The comment tells us that if there's storage
        restriction or the user is in private mode, localStorage, parse or
        stringify can throw.
      </p>
      <p>
        I removed the try-catch block from the initializer code and ran the
        project in a private window and the code didn't throw. That's not to say
        that it won't, but it didn't in Chrome 122. With the try and catch in
        place, I played around with initializing the custom hook with a very
        large string. When the string would exceed the storage quota the hook
        does indeed fail silently - does not throw an error and does not set a
        value in local storage. Removing a character from the string resulted in
        the local storage value being set successfully.
      </p>
    </Wrapper>
  );
};

export default ReactUseLocalStorage;

const Wrapper = styled.div`
  .code-block-wrapper {
    margin: 2rem 0 2rem 0;
  }
  p {
    margin: 1rem 0 1rem 0;
  }
`;

//  <Code text={`Dispatch`} theme={dracula} language="js" />

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
//      theme={dracula}
//      showLineNumbers={false}
//      wrapLongLines={true}
//    />
//  </div>
