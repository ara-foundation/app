import React from 'react';
import { motion } from 'motion/react';
import MermaidDiagram from './MermaidDiagram';

interface OwnershipTransferDiagramProps {
  className?: string;
}

const OwnershipTransferDiagram: React.FC<OwnershipTransferDiagramProps> = ({
  className = '',
}) => {
  const mermaidDefinition = `
    flowchart TD
      Users["Users fund maintainer"]
      Points["☀️ Points<br/>+ 1,000 sunshines"]
      Issues["Issues completed & accepted"]
      Tokens["⭐ 300 tokens minted"]
      Maintainer["⭐ 1/3 Maintainer"]
      User["⭐ 1/3 User"]
      Contributor["⭐ 1/3 Contributor"]
      
      Users --> Points
      Points -->|"Attach ☀️ 1,000 points to issue"| Issues
      Issues --> Tokens
      Tokens --> Maintainer
      Tokens --> User
      Tokens --> Contributor
      
      Maintainer ~~~ User
      User ~~~ Contributor
      
      style Users fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
      style Points fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff
      style Issues fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
      style Tokens fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
      style Maintainer fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
      style User fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
      style Contributor fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
      
      linkStyle 1 stroke:#8b5cf6,stroke-width:3px
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`ownership-transfer-diagram ${className}`}
    >
      <MermaidDiagram definition={mermaidDefinition} />
    </motion.div>
  );
};

export default OwnershipTransferDiagram;

