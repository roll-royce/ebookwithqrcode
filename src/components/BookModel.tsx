import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';

export function BookModel() {
  const meshRef = useRef<any>();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01; // Continuous rotation
    }
  });

  return (
    <Box ref={meshRef} args={[1.5, 2, 0.2]} scale={[1, 1, 1]}>
      <meshStandardMaterial color="#2563eb" metalness={0.5} roughness={0.4} />
    </Box>
  );
}