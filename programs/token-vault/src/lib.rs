use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("9C49PGXttjyqoXQ7t75dj5BjFSWFsxJ3H7EmRLgKknYP");

#[program]
mod token_vault {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: not sure why this is unsafe, quiet the error please
    /// see https://www.anchor-lang.com/docs/the-accounts-struct#safety-checks
    // Derived PDAs
    // #[account(
    //     init_if_needed,
    //     payer = signer,
    //     seeds=[b"token_account_owner_pda"],
    //     bump,
    //     space = 8
    // )]
    // token_account_owner_pda: AccountInfo<'info>,

    // #[account(
    //     init_if_needed,
    //     payer = signer,
    //     seeds=[b"token_vault", mint_of_token_being_sent.key().as_ref()],
    //     token::mint=mint_of_token_being_sent,
    //     token::authority=token_account_owner_pda,
    //     bump
    // )]
    // vault_token_account: Account<'info, TokenAccount>,

    mint_of_token_being_sent: Account<'info, Mint>,

    #[account(mut)]
    signer: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

// #[derive(Accounts)]
// pub struct TransferAccounts<'info> {
//     // Derived PDAs
//     #[account(mut,
//         seeds=[b"token_account_owner_pda"],
//         bump
//     )]
//     token_account_owner_pda: AccountInfo<'info>,
//
//     // #[account(mut,
//     //     seeds=[b"token_vault", mint_of_token_being_sent.key().as_ref()],
//     //     bump,
//     //     token::mint=mint_of_token_being_sent,
//     //     token::authority=token_account_owner_pda,
//     // )]
//     // vault_token_account: Account<'info, TokenAccount>,
//
//     #[account(mut)]
//     sender_token_account: Account<'info, TokenAccount>,
//
//     mint_of_token_being_sent: Account<'info, Mint>,
//
//     #[account(mut)]
//     signer: Signer<'info>,
//     system_program: Program<'info, System>,
//     token_program: Program<'info, Token>,
//     rent: Sysvar<'info, Rent>,
// }
