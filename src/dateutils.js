
/**
 * 时间处理工具
 */


/**
 * 将时间戳转为yyyy-MM-dd HH:mm:ss的形式
 * @param {number} timestamp 时间戳
 * @returns string
 */
function formattedDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    return formattedDate
}

module.exports = {
    formattedDate
};