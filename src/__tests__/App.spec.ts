import { describe, it, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../App.vue'
import { InMemoryEventStore } from '../eventStore'

async function addThroughForm(wrapper: ReturnType<typeof mount>, title: string, start: string, who: string) {
  await wrapper.find('[data-test="title"]').setValue(title)
  await wrapper.find('[data-test="start"]').setValue(start)
  await wrapper.find('[data-test="who"]').setValue(who)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

async function showList(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('[data-test="toggle-view"]').trigger('click')
}

describe('App', () => {
  it('shows an added event in the shared list', async () => {
    const wrapper = mount(App, { props: { store: new InMemoryEventStore(), pollMs: 0 } })

    await addThroughForm(wrapper, 'Team lunch', '2026-10-15T12:00', 'Antonio')
    await showList(wrapper)

    expect(wrapper.find('[data-test="events"]').text()).toContain('Team lunch')
    expect(wrapper.find('[data-test="events"]').text()).toContain('Antonio')
  })

  it('shows events another person added to the same store', async () => {
    const store = new InMemoryEventStore()
    const antonio = mount(App, { props: { store, pollMs: 0 } })
    const dana = mount(App, { props: { store, pollMs: 0 } })

    await addThroughForm(antonio, 'Team lunch', '2026-10-15T12:00', 'Antonio')
    await (dana.vm as unknown as { refresh: () => Promise<void> }).refresh()
    await flushPromises()
    await showList(dana)

    expect(dana.find('[data-test="events"]').text()).toContain('Team lunch')
  })
})

describe('Calendar view', () => {
  it('shows the week grid by default', async () => {
    const wrapper = mount(App, { props: { store: new InMemoryEventStore(), pollMs: 0 } })

    await addThroughForm(wrapper, 'Austin City Limits', '2026-10-17T18:00', 'Llewellyn')

    expect(wrapper.find('[data-test="week-view"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="events"]').exists()).toBe(false)
  })

  it('toggles between the week grid and the list', async () => {
    const wrapper = mount(App, { props: { store: new InMemoryEventStore(), pollMs: 0 } })

    await showList(wrapper)
    expect(wrapper.find('[data-test="week-view"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="events"]').exists()).toBe(true)

    await wrapper.find('[data-test="toggle-view"]').trigger('click')
    expect(wrapper.find('[data-test="week-view"]').exists()).toBe(true)
  })
})

describe('Everyone sees feed', () => {
  it('shows the most recently added event first', async () => {
    const wrapper = mount(App, { props: { store: new InMemoryEventStore(), pollMs: 0 } })

    await addThroughForm(wrapper, 'Austin City Limits', '2026-10-17T18:00', 'Llewellyn')
    await addThroughForm(wrapper, 'Standup', '2026-10-12T09:00', 'Antonio')

    const items = wrapper.findAll('[data-test="feed"] li').map((li) => li.text())
    expect(items[0]).toContain('Antonio added Standup')
    expect(items[1]).toContain('Llewellyn added Austin City Limits')
  })
})

describe('Members legend', () => {
  it('lists each distinct person who added events', async () => {
    const wrapper = mount(App, { props: { store: new InMemoryEventStore(), pollMs: 0 } })

    await addThroughForm(wrapper, 'Team lunch', '2026-10-15T12:00', 'Antonio')
    await addThroughForm(wrapper, 'Austin City Limits', '2026-10-17T18:00', 'Llewellyn')
    await addThroughForm(wrapper, 'Standup', '2026-10-16T09:00', ' antonio')

    const members = wrapper.findAll('[data-test="member"]').map((m) => m.attributes('title'))
    expect(members).toEqual(['Antonio', 'Llewellyn'])
    expect(wrapper.find('[data-test="member-count"]').text()).toBe('2 members')
  })
})
