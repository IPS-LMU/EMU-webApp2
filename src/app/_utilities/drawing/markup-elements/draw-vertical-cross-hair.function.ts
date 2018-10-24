export function drawVerticalCrossHair(ctx, mouseX) {
    if (mouseX === null) {
        return;
    }
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, ctx.canvas.height);
    ctx.stroke();
}
