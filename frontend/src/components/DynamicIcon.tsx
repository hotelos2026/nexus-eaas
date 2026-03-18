import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

// 1. On définit une interface pour les types des Props
interface DynamicIconProps extends LucideProps {
  name: string;
  size?: number;
  color?: string;
}

export const DynamicIcon = ({ name, size = 20, color = 'currentColor', ...props }: DynamicIconProps) => {
  // 2. On récupère l'icône dans la liste de Lucide
  // On utilise "as any" ici pour calmer l'indexation dynamique de TS sur l'objet Icons
  const LucideIcon = (Icons as any)[name];

  // 3. Si l'icône n'existe pas ou n'est pas un composant, on met un fallback (Package)
  if (!LucideIcon || typeof LucideIcon !== 'function' && typeof LucideIcon !== 'object') {
    return <Icons.Package size={size} color={color} {...props} />;
  }

  // 4. On retourne le composant trouvé
  return <LucideIcon size={size} color={color} {...props} />;
};