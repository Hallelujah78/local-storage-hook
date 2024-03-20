import useLocalStorage from "../hooks/useLocalStorageReactUse";
import styled from "styled-components";
import { CodeBlock, Code, dracula } from "react-code-blocks";

import { serialize, deserialize } from "../utils/utils";

const ReactUseLocalStorage = () => {
  const [value, setValue, remove] = useLocalStorage(
    "value",
    {
      email: /^j(ohn){0,1}(\.){0,1}doe@example.com$/i,
      name: "John Doe",
      yearOfBirth: 1988,
    },
    { raw: false, serializer: serialize, deserializer: deserialize }
  );
  return (
    <Wrapper>
      <div>Value: {value ? value.email.toString() : null}</div>
      <button
        onClick={() =>
          setValue({
            email: /^j(ohn){0,1}(\.){0,1}doe@example.com$/i,
            name: "John Doe",
            yearOfBirth: 1987,
          })
        }
      >
        bar
      </button>
      <button
        onClick={() =>
          setValue({
            email: /^g(avan){0,1}(\.){0,1}browne@example.com$/i,
            name: "Gavan Browne",
            yearOfBirth: 1978,
          })
        }
      >
        baz
      </button>
      <button onClick={() => remove()}>Remove</button>
      <button onClick={() => setValue(undefined)}>Undefined</button>
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
        error if the key is null, since it is required. Next, we initialize the
        deserializer.
      </p>
      <h1>A Tangent on Serialization/Deserialization</h1>
      <p>
        From Wikipedia: In computing, serialization is the process of
        translating a data structure or object state into a format that can be
        stored or transmitted and reconstructed later. If we have provided
        parser options and raw is true, then the deserializer is set to an
        anonymous function that takes a value of unknown type and returns that
        value. It appears to do nothing to the input. If raw is false, then
        serializer and deserializer must have values - this is how the
        parserOptions type is set up - and we set the deserializer to
        options.deserializer. Note, if options is false then the deserializer
        defaults to JSON.parse.
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
      <h1>Back to the useLocalStorage Custom Hook</h1>
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
      <h1>A useRef Tangent</h1>
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
      <h1>Back to useLocalStorage</h1>
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
        large string. When the string exceeds the storage quota the hook does
        indeed fail silently - does not throw an error and does not set a value
        in local storage. Removing a character from the string resulted in the
        local storage value being set successfully. Initializing the hook with a
        large string and then setting some other local storage value that
        doesn't use the hook will cause localStorage.set to throw.
      </p>
      <p>
        <Code text={`initializer.current`} theme={dracula} language="js" />{" "}
        references the anonymous function that takes an argument key of type
        string. It appears that to invoke this function we use{" "}
        <Code text={`initializer.current(key)`} theme={dracula} language="js" />
        . We could remove the useRef to see what the effect might be. I'll do
        this later. After the initializer, we have some state that uses the
        initializer:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={` const [state, setState] = useState<T | undefined>(() =>
    initializer.current(key)
  );`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        As noted above, state is initialized with initializer.current(key) and
        so should reference the initialValue on first render. Next, we have a
        useLayoutEffect:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`// eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => setState(initializer.current(key)), [key]);`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <h1>A useLayoutEffect Tangent</h1>
      <p>
        Both useLayoutEffect and useEffect can be used to do the same thing.The
        useEffect hook runs after react renders your component and ensures that
        your effect callback does not block browser painting. It's more
        performant this way and most of the time this is what you want. If your
        effect is mutating the DOM (via a DOM node ref) and the DOM mutation
        will change the appearance of the DOM node between the time that it is
        rendered and your effect mutates it, then you don't want to use
        useEffect. You'll want to use useLayoutEffect.
      </p>
      <p>
        The useLayoutEffect hook runs synchronously immediately after React has
        performed all DOM mutations. This can be useful if you need to make DOM
        measurements (like getting the scroll position or other styles for an
        element) and then make DOM mutations or trigger a synchronous re-render
        by updating state. Your code runs immediately after the DOM has been
        updated, but before the browser has had a chance to "paint" those
        changes (the user doesn't actually see the updates until after the
        browser has repainted).
      </p>
      <p>
        A special case whee useLayoutEffect should be used instead of useEffect
        is where you are updating a value, like a ref, and you want to make sure
        it's up-to-date before any other code runs.
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`const ref = React.useRef()
React.useEffect(() => {
  ref.current = 'some value'
})

// then, later in another hook or something
React.useLayoutEffect(() => {
  console.log(ref.current) // <-- this logs an old value because this runs first!
})`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>In the above example, use useLayoutEffect.</p>
      <h1>Back to our useLocalStorage Custom Hook</h1>
      <p>A reminder of our useLayoutEffect:</p>

      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={` // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => setState(initializer.current(key)), [key]);`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        At this point we know we are using this in place of a useEffect.
        Everytime the key changes (the dependency array), we are synchronously
        setting the value of state to be whatever is returned by
        initializer.current(key).
      </p>
      <p>From the React dev docs:</p>
      <p>
        You can mutate the ref.current property. Unlike state, it is mutable.
        However, if it holds an object that is used for rendering (for example,
        a piece of your state), then you shouldn't mutate that object. When you
        change the ref.current property, React does not re-render your
        component. React is not aware of when you change it because a ref is a
        plain JavaScript object. Do not write or read ref.current during
        rendering, except for initialization. This makes your component's
        behavior unpredictable. This means refs are perfect for storing
        information that doesn't affect the visual output of your component. The
        ref information is local to each copy of your component.
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`function MyComponent() {
  // ...
  // 🚩 Don't write a ref during rendering
  myRef.current = 123;
  // ...
  // 🚩 Don't read a ref during rendering
  return <h1>{myOtherRef.current}</h1>;
}`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>Read or write refs from event handlers or effects instead:</p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`function MyComponent() {
  // ...
  useEffect(() => {
    // ✅ You can read or write refs in effects
    myRef.current = 123;
  });
  // ...
  function handleClick() {
    // ✅ You can read or write refs in event handlers
    doSomething(myOtherRef.current);
  }
  // ...
}`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>Next, we have a function declaration, set, which is a state setter:</p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`  // eslint-disable-next-line react-hooks/rules-of-hooks
  const set: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (valOrFunc) => {
      try {
        const newState =
          typeof valOrFunc === "function"
            ? (valOrFunc as Function)(state)
            : valOrFunc;
        if (typeof newState === "undefined") return;
        let value: string;

        if (options)
          if (options.raw)
            if (typeof newState === "string") value = newState;
            else value = JSON.stringify(newState);
          else if (options.serializer) value = options.serializer(newState);
          else value = JSON.stringify(newState);
        else value = JSON.stringify(newState);

        localStorage.setItem(key, value);
        setState(deserializer(value));
      } catch {
        // If user is in private mode or has storage restriction
        // localStorage can throw. Also JSON.stringify can throw.
      }
    },
    [key, setState]
  );`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        The set function is of type{" "}
        <Code text={`Dispatch<SetStateAction>`} theme={dracula} language="ts" />
        . Set takes a value or a function. If valOrFunc is a function, then
        newState is set to the result of invoking the function with the argument{" "}
        <Code text={`state`} theme={dracula} language="js" />. Otherwise,
        newState is set to the value of valOrFunc.
      </p>
      <h1>A useCallback Tangent</h1>
      <p>
        According to the useCallback docs: If you're writing a custom Hook, it's
        recommended to wrap any functions that it returns into useCallback. This
        ensures that the consumers of your Hook can optimize their own code when
        needed. The optimization here is reducing rerenders. According to
        ChatGPT:
      </p>
      <ul>
        <li>
          Wrapping a function definition in a custom hook in useCallback means
          that the function returned by the hook remains the same between
          re-renders as long as the dependencies haven't changed.
        </li>
        <li>
          When a function is passed to a child component as a prop, the default
          behaviour in React is to create a new function instance on every
          render.
        </li>
        <li>
          {" "}
          If the function is defined inline within the component or if it's a
          result of calling a function inside the component, this can cause
          unnecessary re-renders in child components because they detect a
          change in the function reference.
        </li>
        <li>
          By wrapping the function in useCallback, React will memoize the
          function instance and only create a new one if the dependencies
          specified in the useCallback array change. This means that if the
          dependencies don't change between renders, the same function instance
          will be reused, preventing unnecessary re-renders in child components
          that rely on this function.
        </li>
      </ul>
      <p>An example from ChatGPT:</p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`import React, { useState, useCallback } from 'react';

function useCustomHook() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, [setCount]);

  return { count, increment };
}

function ChildComponent({ onClick }) {
  console.log('ChildComponent re-rendered');
  return <button onClick={onClick}>Increment</button>;
}

function ParentComponent() {
  const { count, increment } = useCustomHook();

  return (
    <div>
      <p>Count: {count}</p>
      <ChildComponent onClick={increment} />
    </div>
  );
}
`}
          language={"jsx"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        In this example, increment is wrapped in useCallback. This ensures that
        ChildComponent won't re-render unnecessarily when ParentComponent
        re-renders, because increment remains the same function instance as long
        as setCount (its dependency) remains the same. This optimization can
        lead to improved performance, especially in large and complex
        applications.
      </p>
      <h1>
        Back to the <Code text={`set`} theme={dracula} language="js" /> State
        Setter
      </h1>
      <p>
        Set is wrapped in useCallback to reduce rerenders. Also, remember, since
        it is a state setter, it can take a callback that takes the previous
        state and performs some action on it before returning the new state. And
        so it makes sense that the argument for{" "}
        <Code text={`set`} theme={dracula} language="js" /> is valOrFunc, and
        where it is a function it gets invoked with{" "}
        <Code text={`state`} theme={dracula} language="js" />, which is the old
        state.
      </p>
      <p>
        The remainder of our try block inside{" "}
        <Code text={`set`} theme={dracula} language="js" />:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={` if (typeof newState === "undefined") return;
        let value: string;

        if (options)
          if (options.raw)
            if (typeof newState === "string") value = newState;
            else value = JSON.stringify(newState);
          else if (options.serializer) value = options.serializer(newState);
          else value = JSON.stringify(newState);
        else value = JSON.stringify(newState);

        localStorage.setItem(key, value);
        setState(deserializer(value));`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        Here, newState can be undefined, and so if it is undefined we simply
        return. Two points here, in useLocalStorage we export{" "}
        <Code text={`[state, set, remove];`} theme={dracula} language="js" />.
        When that is destructured in our ReactUseLocalStorage.tsx component it
        can be renamed to whatever we want. In the example code from react-use
        it is destructed as:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`const [value, setValue, remove] = useLocalStorage("value", "foo");`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        {" "}
        It is the order of the items in the array that determines how they
        correspond to the exported array. This is a small point, but something I
        wasn't aware of and is probably a JavaScript thing and not a React
        thing.
      </p>
      <p>
        Point two, the code that returns if newState is undefined appears to be
        so that nothing happens if we call{" "}
        <Code text={`set(undefined)`} theme={dracula} language="js" /> or{" "}
        <Code text={`set(()=>undefined)`} theme={dracula} language="js" />, and
        it is possible to call{" "}
        <Code text={`set`} theme={dracula} language="js" /> in this way.
      </p>
      <p>
        The remainder of the code is straightforward enough. If options is
        truthy and options raw is true, then newState is a string and should not
        need to be serialized and so the value of value is set to newState.
        Otherwise, newState is serialized with a custom serializer or
        stringified with JSON.stringify as appropriate. Finally we set local
        storage to the key/value pair and we set the state. Again, the try-catch
        is there as JSON.stringify and/or localStorage can throw.
      </p>
      <p>Lastly, the dependency array is missing deps:</p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`React Hook useCallback has missing dependencies: 'deserializer', 'options', and 'state'. Either include them or remove the dependency array.`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        Not sure why these have been omitted. Adding two of the missing
        dependencies doesn't appear to create any problems, although there could
        be performance issues or the inclusion of the dependencies are just
        unnecessary. Including all three omitted dependencies causes a further
        eslint warning in relation to this code:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`const deserializer = options
    ? options.raw
      ? (value: unknown) => value
      : options.deserializer
    : JSON.parse;`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>The warning is:</p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`The 'deserializer' conditional could make the dependencies of useCallback Hook (at line 99) change on every render. To fix this, wrap the initialization of 'deserializer' in its own useMemo() Hook.`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        The <Code text={`remove`} theme={dracula} language="js" /> function is
        straightforward and doesn't require explanation:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`// eslint-disable-next-line react-hooks/rules-of-hooks
  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(undefined);
    } catch {
      // If user is in private mode or has storage restriction
      // localStorage can throw.
    }
  }, [key, setState]);`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <h1>
        Exploring the Code with{" "}
        <Code text={`console.log`} theme={dracula} language="js" />
      </h1>
      <p>
        By placing a console.log in the body of the hook, we can see that it
        runs when the app first loads and whenever we click the bar, baz, or
        remove buttons. That is, when we call{" "}
        <Code text={`set`} theme={dracula} language="js" /> or{" "}
        <Code text={`remove`} theme={dracula} language="js" />.
      </p>
      <p>
        Using set (with the same value) or remove twice in a row will cause
        output to the console each click. Calling them a third time, there will
        be no output.
      </p>
      <ul>
        <li>The deserializer is set each time the hook runs.</li>
        <li>
          The initializer is only set when the app first loads and the hook is
          initially called. Hence, the deserializer is only initialized once on
          load.
        </li>
        <li>
          Obviously, useState (state and setState) is only called and
          initialized by the initializer on load.
        </li>
        <li>
          The useLayoutEffect only runs once on load, since the key prop in its
          dependency array only changes when the programmer changes it in the
          code.
        </li>
      </ul>
      <h1>Can We Change or Improve this Code?</h1>
      <p>
        One question that occurs is why is the serializer initialized inside the
        initializer, and so only initialized once, but the deserializer is
        initialized outside the initializer and is initialized every time that
        set or remove is called. In fact, it's initialized any time that a
        component that uses the hook is re-rendered.
      </p>
      <p>The purpose of the initializer is to:</p>
      <ul>
        <li>Check if local storage is empty.</li>
        <li>
          If local storage is not empty, deserialize it and return the value.
        </li>
        <li>
          If local storage is empty, serialize the initial value and return that
          initial value.
        </li>
        <li>The returned value from initializer is used to set state.</li>
      </ul>
      <h1>Potential Options</h1>
      <h2>Option 1</h2>
      <p>
        Move <Code text={`deserializer`} theme={dracula} language="js" /> inside{" "}
        <Code text={`initializer`} theme={dracula} language="js" />. You would
        then have to do something like the following inside{" "}
        <Code text={`set`} theme={dracula} language="js" />:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={` if (options)
          if (options.raw) setState(newState);
          else setState(options.deserializer(value));
        else setState(JSON.parse(value));`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        Using this option, we can also add{" "}
        <Code text={`options`} theme={dracula} language="js" /> and{" "}
        <Code text={`state`} theme={dracula} language="js" /> to the dependency
        array of our <Code text={`set`} theme={dracula} language="js" />{" "}
        function and clear that eslint warning.
      </p>
      <h2>Option 2</h2>
      <p>
        Make <Code text={`deserializer`} theme={dracula} language="js" /> a ref:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`// eslint-disable-next-line react-hooks/rules-of-hooks
  const deserializer = useRef(() => {
    return options
      ? options.raw
        ? (value: unknown) => value
        : options.deserializer
      : JSON.parse;
  });`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
      <p>
        Invoke similarly to how initializer is invoked:{" "}
        <Code
          text={`deserializer.current(localStorageValue)`}
          theme={dracula}
          language="js"
        />
        . This is not working for me but might possibly work.
      </p>
      <h2>Option 3</h2>
      <p>
        Have initializer return an object that has initialValue, serializer and
        deserializer on it. This will add more boilerplate. This does work:
      </p>
      <div
        className="code-block-wrapper"
        style={{
          fontFamily: "Fira Code",
          fontSize: "calc(0.90rem + 0.390625vw)",
        }}
      >
        <CodeBlock
          text={`const [state, setState] = useState<T | undefined>(() => {
    return initializer.current(key).initialValue;
  });`}
          language={"js"}
          theme={dracula}
          showLineNumbers={false}
          wrapLongLines={true}
        />
      </div>
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
  li {
    list-style: inside;
  }
  h2 {
    font-size: calc(1.25rem + 0.390625vw);
  }
`;
