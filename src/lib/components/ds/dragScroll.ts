export function dragScroll(node: HTMLElement) {
  let isDragging = false;
  let startY = 0;
  let startScrollTop = 0;

  function onMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, [role="button"], select')) return;
    isDragging = true;
    startY = e.pageY;
    startScrollTop = node.scrollTop;
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    e.preventDefault();
    const delta = (e.pageY - startY) * 1.25;
    node.scrollTop = startScrollTop - delta;
  }

  function onMouseUp() {
    isDragging = false;
  }

  node.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  return {
    destroy() {
      node.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
  };
}
