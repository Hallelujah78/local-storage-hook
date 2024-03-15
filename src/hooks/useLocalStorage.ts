const useLocalStorage = () => {
  const getLocalStorage = (key: string) => {
    const storeItem = localStorage.getItem(key);
    return storeItem ? JSON.parse(storeItem) : null;
  };

  const setLocalStorage = (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  return { getLocalStorage, setLocalStorage };
};

export default useLocalStorage;
