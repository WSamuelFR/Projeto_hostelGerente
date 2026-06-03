-- Migration: 002_remove_unused_tables
-- Created at: 2026-06-03
-- Database: SQLite

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS financeiro;
DROP TABLE IF EXISTS pagamento_chekin;
DROP TABLE IF EXISTS consumo_checkin;
DROP TABLE IF EXISTS venda_balcao;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS logs;

PRAGMA foreign_keys = ON;
