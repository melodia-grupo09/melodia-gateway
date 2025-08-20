import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { randomUUID } from "crypto";
import { ClassCtor, toDTO } from "../utils/dto.utils";
import { BaseEntity as BE } from "@mikro-orm/core";

@Entity({ abstract: true })
export abstract class BaseEntity<
  Entity extends object,
  Optional extends keyof Entity = never,
> extends BE {
  [OptionalProps]?: Optional | "createdAt" | "updatedAt";

  @PrimaryKey({ type: "uuid" })
  id = randomUUID();

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  toDTO<Dto extends object>(dtoClass: ClassCtor<Dto>): Dto {
    return toDTO(this, dtoClass);
  }
}
