import React from 'react'

/**
 * Hand-drawn SVG decorative elements for the architectural sketchbook aesthetic.
 * All decorations are lightweight, scalable SVGs using the pencil-black stroke
 * and paper-friendly accents.
 */

/** Hand-drawn squiggly underline */
export function SketchUnderline({ color = 'var(--accent-red)', width = 120, height = 10, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <path
        d="M2 5C18 2 34 8 50 4C66 1 82 8 98 4C108 2 116 6 118 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Double squiggly underline for emphasis */
export function SketchDoubleUnderline({ color = 'var(--accent-blue)', width = 140, height = 14, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 140 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <path
        d="M2 4C22 1.5 45 7 70 3.5C95 1 115 6 138 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 10C26 7.5 50 12 75 9C100 6.5 120 11 135 9.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}

/** Hand-drawn arrow pointing right or down */
export function SketchArrow({
  direction = 'right',
  color = 'var(--ink-black)',
  width = 36,
  height = 24,
  className = '',
}) {
  if (direction === 'down') {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M12 2C11 12 13 22 12 30M12 30C8 24 6 22 4 19M12 30C15 25 18 22 20 19"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // default 'right'
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 12C12 11 22 13 30 12M30 12C24 8 22 6 19 4M30 12C25 15 22 18 19 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Curved hand-drawn annotation arrow */
export function SketchCurvedArrow({
  color = 'var(--accent-red)',
  width = 48,
  height = 36,
  className = '',
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 32C12 26 24 10 40 8M40 8L32 6M40 8L36 16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Scribble circle around an element */
export function ScribbleCircle({
  color = 'var(--accent-red)',
  width = 110,
  height = 44,
  className = '',
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 110 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <path
        d="M10 22C8 10 32 3 65 4C96 5 106 14 104 26C101 37 72 41 40 40C16 39 3 32 6 20C8 11 36 6 62 6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Adhesive tape strip on top of sticky notes or cards */
export function SketchTape({ className = '', style = {} }) {
  return (
    <div
      className={`sketch-tape ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

/** Hand-drawn push pin */
export function SketchPushPin({
  color = 'var(--accent-red)',
  size = 20,
  className = '',
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Pin head */}
      <circle cx="12" cy="7" r="5" fill={color} stroke="var(--ink-black)" strokeWidth="1.5" />
      {/* Pin base */}
      <path d="M8 11H16L13 14H11L8 11Z" fill="var(--bg-paper-muted)" stroke="var(--ink-black)" strokeWidth="1.5" />
      {/* Needle */}
      <line x1="12" y1="14" x2="12" y2="22" stroke="var(--ink-black)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Hand-drawn star mark for highlighting features */
export function SketchStar({
  color = 'var(--accent-red)',
  size = 18,
  className = '',
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 2L12 7.5L18 8L13.5 12L15 18L10 14.5L5 18L6.5 12L2 8L8 7.5L10 2Z"
        fill={color}
        stroke="var(--ink-black)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
