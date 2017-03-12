function pad(num, targetLength) {
    num = num.toString();
    if(num.length === targetLength) return num;
    targetLength = targetLength - num.length;
    let pad = "0".repeat(targetLength);
    return pad + num;
  }

  export default pad;