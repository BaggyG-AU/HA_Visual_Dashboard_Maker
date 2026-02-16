import type { Action } from './actions';
import type { StateStyleRule, TriggerAnimationConfig, VisualLogicContract } from './logic';

export interface ActionBindingContract {
  smart_defaults?: boolean;
  tap_action?: Action;
  hold_action?: Action;
  double_tap_action?: Action;
}

export interface StateStylingContract {
  state_styles?: StateStyleRule[];
}

export interface TriggerAnimationContract {
  trigger_animations?: TriggerAnimationConfig[];
}

export interface Phase6CardContracts extends ActionBindingContract, VisualLogicContract, StateStylingContract, TriggerAnimationContract {}
