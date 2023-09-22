import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator'
import Emoji from './emoji'
import Role from './role'
import RoleList from './role-list'
import { decorators } from '../utils'

const { Nand } = decorators

@Entity('roles_role_lists')
export default class RoleRoleList {
  @PrimaryColumn({ name: 'role_id', type: 'bigint' })
  @IsNumberString({ no_symbols: true })
  public roleId!: string

  @PrimaryColumn({ name: 'role_list_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public roleListId!: number

  @Column('varchar', { name: 'emoji_name', length: 7, nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Nand('emojiId')
  public emojiName?: string | null

  @Column('bigint', { name: 'emoji_id', nullable: true })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  @Nand('emojiName')
  public emojiId?: string | null

  @ManyToOne(() => Role, role => role.roleRoleLists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  @ValidateIf(roleRoleList => typeof roleRoleList.role !== 'undefined')
  @ValidateNested()
  public role?: Role

  @ManyToOne(() => RoleList, roleList => roleList.roleRoleLists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_list_id' })
  @ValidateIf(roleRoleList => typeof roleRoleList.roleList !== 'undefined')
  @ValidateNested()
  public roleList?: RoleList

  @ManyToOne(() => Emoji, emoji => emoji.roleRoleLists, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'emoji_id' })
  @IsOptional()
  @ValidateNested()
  public emoji?: Emoji | null
}
