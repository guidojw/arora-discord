import type { BaseManager } from '../managers'
import type { interfaces } from 'inversify'

export type Constructor<T = {}> = new (...args: any[]) => T
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T
export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>
export type Enum = Record<string, number | string>
export type EnumKeys<T extends Enum> = Exclude<keyof T, number>
export type KeyOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T]
export type AnyFunction<T = any> = (...input: any[]) => T
export type Tail<T extends any[]> = T extends [any, ...infer U] ? U : never

export type OverloadedParameters<T> = Overloads<T> extends infer U
  ? { [K in keyof U]: Parameters<Extract<U[K], (...args: any) => any>> }
  : never

export type OverloadedReturnType<T> = Overloads<T> extends infer U
  ? { [K in keyof U]: ReturnType<Extract<U[K], (...args: any) => any>> }
  : never

// Supports up to 4 overload signatures.
type Overloads<T> = T extends {
  (...args: infer A1): infer R1
  (...args: infer A2): infer R2
  (...args: infer A3): infer R3
  (...args: infer A4): infer R4
} ? [
      (...args: A1) => R1,
      (...args: A2) => R2,
      (...args: A3) => R3,
      (...args: A4) => R4
    ] : T extends {
      (...args: infer A1): infer R1
      (...args: infer A2): infer R2
      (...args: infer A3): infer R3
    } ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3
        ] : T extends {
          (...args: infer A1): infer R1
          (...args: infer A2): infer R2
        } ? [
              (...args: A1) => R1,
              (...args: A2) => R2
            ] : T extends (...args: infer A1) => infer R1
              ? [(...args: A1) => R1]
              : any

export type ManagerFactory = <
  T extends BaseManager<K, U, unknown>,
  U extends { id: K },
  K extends number | string = number | string
  > (managerName: string) =>
  interfaces.SimpleFactory<T, T['setOptions'] extends ((...args: infer P) => unknown) ? P : never[]>
