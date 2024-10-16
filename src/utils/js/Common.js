// export const typewatch = (function () {
//     var timer = 0;
//     return function (callback, ms) {
//       clearTimeout(timer);
//       timer = setTimeout(callback, ms);
//     };
//   })();
export const debounce = (callback, delay) => {
  let timer;
  return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
      callback(...args);
      }, delay);
    };
};
export const formatDate = (utcDate) => {
  if (!utcDate) return '-';
  const date = new Date(utcDate); 
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
  const day = String(date.getUTCDate()).padStart(2, '0'); 
  return `${year}-${month}-${day}`;
}
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          resolve(reader.result);
      };
      reader.onerror = (error) => {
          reject(error);
      };
      reader.readAsDataURL(file);
  });
}
