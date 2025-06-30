import { test, expect, vi, afterEach } from 'vitest'
import { POST, withMetadata } from '.'

const infoMock = vi.fn()

vi.mock('../../logger', () => {
    return {
        teamLogger: {
            child: vi.fn(() => ({
                info: infoMock,
            })),
        },
    }
})

afterEach(() => {
    infoMock.mockClear()
})

test('Normal POST should work as expected', async (t) => {
    const testRequest = new Request('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ level: { label: 'info' }, ts: 123, messages: ['test'] }),
        headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(testRequest)
    const result = await response.json()

    expect(result).toEqual({ ok: 'ok' })
    expect(infoMock).toHaveBeenCalledTimes(1)
    expect(infoMock).toHaveBeenCalledWith('test')
})

test('withMetadata should add metadata', async (t) => {
    const testRequest = new Request('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ level: { label: 'info' }, ts: 123, messages: ['test'] }),
        headers: { 'Content-Type': 'application/json' },
    })

    const response = await withMetadata(() => ({
        myMetadata: 'foo-bar',
    }))(testRequest)
    const result = await response.json()

    expect(result).toEqual({ ok: 'ok' })
    expect(infoMock).toHaveBeenCalledTimes(1)
    expect(infoMock).toHaveBeenCalledWith('test')
})
