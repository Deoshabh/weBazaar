/**
 * Custom layout for the /landing route.
 * Removes the default app navbar, footer, and announcement bar
 * to provide a full immersive experience with custom navigation.
 */
export default function LandingLayout({ children }) {
  return (
    <div
      style={{
        /* Override the main layout padding */
        marginTop: 'calc(-1 * var(--navbar-offset, 80px))',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {children}
    </div>
  );
}
