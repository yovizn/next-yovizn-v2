// File: /lib/analytics/googleEvents.ts

import { sendGAEvent, sendGTMEvent } from '@next/third-parties/google'

type LinkEvent = {
  event: 'linkClicked' | 'anchorClicked'
  url: string
}

type ButtonEvent = {
  event: 'buttonClicked'
  name: string
  value?: string
}

type GoogleEvent = LinkEvent | ButtonEvent

export const handleGoogleEvent = (eventData: GoogleEvent) => {
  const { event } = eventData

  const gtmPayloads = {
    buttonClicked: {
      event,
      value: `Button ${(eventData as ButtonEvent).name} was ${(eventData as ButtonEvent).value || 'clicked'}`,
    },
    linkClicked: { event, linkUrl: (eventData as LinkEvent).url },
    anchorClicked: { event, linkUrl: (eventData as LinkEvent).url },
  }

  const gaPayloads = {
    buttonClicked: {
      action: 'button_click',
      params: {
        event_category: 'engagement',
        event_label: `Button ${(eventData as ButtonEvent).name}`,
      },
    },
    linkClicked: {
      action: 'link_click',
      params: {
        event_category: 'navigation',
        event_label: (eventData as LinkEvent).url,
      },
    },
    anchorClicked: {
      action: 'anchor_click',
      params: {
        event_category: 'navigation',
        event_label: (eventData as LinkEvent).url,
      },
    },
  }

  sendGTMEvent(gtmPayloads[event])
  sendGAEvent('event', gaPayloads[event].action, gaPayloads[event].params)
}
