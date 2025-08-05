declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'environment-image'?: string;
        'skybox-image'?: string;
        loading?: 'auto' | 'lazy' | 'eager';
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
  }
}
