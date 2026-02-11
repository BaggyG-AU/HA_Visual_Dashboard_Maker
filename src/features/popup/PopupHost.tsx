import React, { useEffect, useState } from 'react';
import { PopupCardModal } from './PopupCardModal';
import { popupStackService } from './popupService';
import type { PopupStackItem } from './types';

export const PopupHost: React.FC = () => {
  const [stack, setStack] = useState<PopupStackItem[]>(() => popupStackService.getStack());

  useEffect(() => popupStackService.subscribe(setStack), []);

  if (stack.length === 0) return null;

  return (
    <>
      {stack.map((item, index) => (
        <PopupCardModal
          key={item.id}
          item={item}
          index={index}
          onClose={() => popupStackService.close(item.id)}
        />
      ))}
    </>
  );
};
