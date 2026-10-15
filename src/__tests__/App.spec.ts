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
