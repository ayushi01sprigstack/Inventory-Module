// export const typewatch = (function () {
//     var timer = 0;
//     return function (callback, ms) {
//       clearTimeout(timer);
//       timer = setTimeout(callback, ms);
//     };
//   })();
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};