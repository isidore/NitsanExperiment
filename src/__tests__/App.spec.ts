import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('shows an added event in the shared list', async () => {
    const wrapper = mount(App)

    await wrapper.find('[data-test="title"]').setValue('Team lunch')
    await wrapper.find('[data-test="start"]').setValue('2026-10-15T12:00')
    await wrapper.find('[data-test="who"]').setValue('Antonio')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[data-test="events"]').text()).toContain('Team lunch')
    expect(wrapper.find('[data-test="events"]').text()).toContain('Antonio')
  })
})

describe('Calendar view', () => {
  it('shows an added event on its day in the week grid', async () => {
    const wrapper = mount(App)

    await wrapper.find('[data-test="title"]').setValue('Austin City Limits')
    await wrapper.find('[data-test="start"]').setValue('2026-10-17T18:00')
    await wrapper.find('[data-test="who"]').setValue('Llewellyn')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('[data-test="toggle-view"]').trigger('click')

    expect(wrapper.find('[data-test="week-view"]').exists()).toBe(true)
  })
})
