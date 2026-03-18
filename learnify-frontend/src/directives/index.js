export const vFocus = {
  mounted(el) {
    el.focus()
  },
}

export const vTooltip = {
  mounted(el, binding) {
    el.setAttribute('title', binding.value)
    el.style.position = 'relative'
    el.style.cursor = 'pointer'

    const tooltip = document.createElement('div')
    tooltip.textContent = binding.value
    Object.assign(tooltip.style, {
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '4px 8px',
      backgroundColor: '#333',
      color: '#fff',
      fontSize: '12px',
      borderRadius: '4px',
      whiteSpace: 'nowrap',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 0.15s ease',
      zIndex: '9999',
      marginBottom: '4px',
    })

    el.appendChild(tooltip)
    el._tooltip = tooltip

    el.addEventListener('mouseenter', () => { tooltip.style.opacity = '1' })
    el.addEventListener('mouseleave', () => { tooltip.style.opacity = '0' })
  },
  updated(el, binding) {
    if (el._tooltip) {
      el._tooltip.textContent = binding.value
      el.setAttribute('title', binding.value)
    }
  },
  unmounted(el) {
    if (el._tooltip) {
      el._tooltip.remove()
    }
  },
}
