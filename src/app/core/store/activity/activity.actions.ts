import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ActivityEvent } from '../../types/activity.types';

export const ActivityActions = createActionGroup({
  source: 'Activity',
  events: {
    'Add Event': props<{ event: ActivityEvent }>(),
    'Clear Events': emptyProps(),
  },
});
