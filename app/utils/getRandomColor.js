const colors = [
    '#0881A3',
    '#F66E00',
    '#E6AF2E',
    '#9C1DE7',
    '#1AA59A',
    '#FF7E67',
    '#09A8FA',
    '#71647C',
    '#F6C90E',
    '#FF4545',
    '#30E3CA'
];

export default function getRandomColor(prevColors) {
    const min = 0;
    const max = colors.length - 1;
    const index = Math.floor(Math.random() * (max - min + 1) + min);
    const color = colors[index];
    if(prevColors.indexOf(color) !== -1) return getRandomColor(prevColors);
    return color;
}