-- IRON FORGE — initial schema
-- Bounded contexts: Identity & Access (role, staff_user), Membership (member, subscription_plan, subscription, payment)

CREATE TABLE role (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE staff_user (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id       BIGINT       NOT NULL,
    deleted       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME     NOT NULL,
    CONSTRAINT fk_staff_user_role FOREIGN KEY (role_id) REFERENCES role (id)
) ENGINE=InnoDB;

CREATE TABLE member (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone_number  VARCHAR(30)  NOT NULL,
    date_of_birth DATE,
    join_date     DATE         NOT NULL,
    deleted       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME     NOT NULL
) ENGINE=InnoDB;

CREATE TABLE subscription_plan (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)   NOT NULL,
    duration_days INT            NOT NULL,
    price_amount  DECIMAL(10,2)  NOT NULL,
    price_currency VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    description   VARCHAR(500),
    active        BOOLEAN        NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE subscription (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id    BIGINT      NOT NULL,
    plan_id      BIGINT      NOT NULL,
    start_date   DATE        NOT NULL,
    end_date     DATE        NOT NULL,
    status       VARCHAR(20) NOT NULL,
    created_at   DATETIME    NOT NULL,
    CONSTRAINT fk_subscription_member FOREIGN KEY (member_id) REFERENCES member (id),
    CONSTRAINT fk_subscription_plan   FOREIGN KEY (plan_id)   REFERENCES subscription_plan (id)
) ENGINE=InnoDB;

CREATE TABLE payment (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT        NOT NULL,
    member_id       BIGINT        NOT NULL,
    amount_amount   DECIMAL(10,2) NOT NULL,
    amount_currency VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    payment_date    DATETIME      NOT NULL,
    method          VARCHAR(20)   NOT NULL,
    status          VARCHAR(20)   NOT NULL,
    created_at      DATETIME      NOT NULL,
    CONSTRAINT fk_payment_subscription FOREIGN KEY (subscription_id) REFERENCES subscription (id),
    CONSTRAINT fk_payment_member       FOREIGN KEY (member_id)       REFERENCES member (id)
) ENGINE=InnoDB;

CREATE INDEX idx_member_deleted        ON member (deleted);
CREATE INDEX idx_staff_user_deleted    ON staff_user (deleted);
CREATE INDEX idx_subscription_member   ON subscription (member_id);
CREATE INDEX idx_payment_member        ON payment (member_id);
CREATE INDEX idx_payment_subscription  ON payment (subscription_id);
