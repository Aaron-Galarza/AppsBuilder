declare module 'react-color' {
  import { Component } from 'react'

  interface ColorPickerProps {
    color: string
    onChange: (color: { hex: string }) => void
    onChangeComplete?: (color: { hex: string }) => void
    style?: React.CSSProperties
  }

  export class HexColorPicker extends Component<ColorPickerProps> {}
  export class ChromePicker extends Component<ColorPickerProps> {}
}
