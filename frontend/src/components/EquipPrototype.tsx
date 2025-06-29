import React from 'react';
// Vite allows importing raw file contents with ?raw
// This will inline the static prototype HTML generated earlier
// Located at ../../equip/index.html relative to this file
// Adjust path if directory differs
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import protoHtml from '../../equip/index.html?raw';

const EquipPrototype: React.FC = () => {
  return (
    <div className="equip-proto" dangerouslySetInnerHTML={{ __html: protoHtml }} />
  );
};

export default EquipPrototype;
