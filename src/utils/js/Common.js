export const typewatch = (function () {
    var timer = 0;
    return function (callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();
// export const debounceFunc = (func, delay) => {
//   let timeoutId;
//   return (...args) => {
//       if (timeoutId) {
//           clearTimeout(timeoutId);
//       }
//       timeoutId = setTimeout(() => {
//           func.apply(null, args);
//       }, delay);
//   };
// };
export const formatDate = (utcDate) => {
  if (!utcDate) return '-';
  const date = new Date(utcDate); 
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
  const day = String(date.getUTCDate()).padStart(2, '0'); 
  return `${year}-${month}-${day}`;
}

