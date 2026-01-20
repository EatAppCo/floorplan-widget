/**
 * Color palette for the floorplan
 */
export const palette = {
  red: '#B00020',
  green100: '#128849',
  brandGreen: '#74BF63',
  white: '#FFFFFF',
  white50: '#F9F9FB',
  white100: '#F8F8F8',
  gray: '#D8D8D8',
  gray50: '#FbFbFb',
  gray100: '#CCCCCC',
  gray200: '#999999',
  gray500: '#979797',
  dark100: '#34353A',
  dark50: '#4A4C50',
  black: '#000000',
} as const;

/**
 * Default table colors
 */
export const DEFAULT_TABLE_FILL_COLOR = palette.white;
export const DEFAULT_TABLE_STROKE_COLOR = '#6F6F6F';

/**
 * Selected table colors
 */
export const SELECTED_TABLE_FILL_COLOR = '#E5F4EB';
export const SELECTED_TABLE_STROKE_COLOR = '#128849';

/**
 * Default table palette
 */
export const DEFAULT_TABLE_PALETTE = {
  text: palette.black,
  icon: null,
  fill: DEFAULT_TABLE_FILL_COLOR,
  stroke: DEFAULT_TABLE_STROKE_COLOR,
  blocked: '#EAEAEA',
  selectedFill: SELECTED_TABLE_FILL_COLOR,
  selectedStroke: SELECTED_TABLE_STROKE_COLOR,
  shadow: null,
  status: null,
  opacity: 1,
} as const;

/**
 * Shape colors available for floor shapes
 */
export const shapeColors = [
  '#E1E8F8',
  '#DBF4F3',
  '#FBE1E6',
  '#EDE5F7',
  '#E4E8EC',
  '#EEE0E8',
  '#D4E9BD',
  '#F9C5A5',
  '#FFE4BA',
  '#AADCB7',
  '#D1ADC1',
  '#AFC1EC',
] as const;
