import { authClient } from './auth';
import { actions } from 'astro:actions';
import type { AuthUser } from '@/types/auth';
import { RepositoryAnalysis } from '@/types/git-repository';
import { Galaxy } from '@/types/galaxy';

/**
 * Analyze Git repository
 */
export async function analyzeGitRepository(
    gitUrl: string
): Promise<{ success: boolean; data?: RepositoryAnalysis; error?: string }> {
    try {
        const session = await authClient.getSession();
        const user = session?.data?.user as AuthUser | undefined;
        if (!user?.id) {
            return { success: false, error: 'User not logged in' };
        }

        const result = await actions.analyzeGitRepository({
            gitUrl,
            userId: user.id,
        });

        if (result.data?.success && result.data.data) {
            return {
                success: true,
                data: result.data.data,
            };
        }
        return {
            success: false,
            error: result.data?.error || 'Failed to analyze repository',
        };
    } catch (error) {
        console.error('Error analyzing Git repository:', error);
        return { success: false, error: 'An error occurred' };
    }
}

/**
 * Create galaxy from Git repository
 */
export async function createGalaxyFromGit(params: RepositoryAnalysis, readmeContent?: string): Promise<{ success: boolean; data?: Galaxy; error?: string }> {
    try {
        const session = await authClient.getSession();
        const user = session?.data?.user as AuthUser | undefined;
        if (!user?.id) {
            return { success: false, error: 'User not logged in' };
        }

        const result = await actions.createGalaxyFromGit({
            ...params,
            userId: user.id,
            readmeContent,
        });

        if (result.data?.success && result.data.data) {
            return {
                success: true,
                data: result.data.data,
            };
        }
        return {
            success: false,
            error: result.data?.error || 'Failed to create galaxy',
        };
    } catch (error) {
        console.error('Error creating galaxy from Git:', error);
        return { success: false, error: 'An error occurred' };
    }
}

/**
 * Create blockchain transaction for galaxy
 */
export async function createGalaxyBlockchainTransaction(
    galaxyId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const session = await authClient.getSession();
        const user = session?.data?.user as AuthUser | undefined;
        if (!user?.id) {
            return { success: false, error: 'User not logged in' };
        }
        console.log(`Creating blockchain transaction for galaxy ${galaxyId} by user ${user.id}`);
        const result = await actions.createGalaxyBlockchainTransaction({
            galaxyId,
            userId: user.id,
        });

        if (result.data?.success && result.data.data) {
            return {
                success: true,
                data: result.data.data,
            };
        }
        return {
            success: false,
            error: result.data?.error || 'Failed to create blockchain transaction',
        };
    } catch (error) {
        console.error('Error creating blockchain transaction:', error);
        return { success: false, error: 'An error occurred' };
    }
}

/**
 * Update project README content
 */
export async function updateProjectReadme(
    projectId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const session = await authClient.getSession();
        const user = session?.data?.user as AuthUser | undefined;
        if (!user?.id) {
            return { success: false, error: 'User not logged in' };
        }

        const result = await actions.updateProjectReadme({
            projectId,
            userId: user.id,
        });

        if (result.data?.success && result.data.data) {
            return {
                success: true,
                data: result.data.data,
            };
        }
        return {
            success: false,
            error: result.data?.error || 'Failed to update README',
        };
    } catch (error) {
        console.error('Error updating project README:', error);
        return { success: false, error: 'An error occurred' };
    }
}

/**
 * Update galaxy coordinates
 */
export async function updateGalaxyCoordinates(
    galaxyId: string,
    x?: number,
    y?: number
): Promise<{ success: boolean; txId?: string; order: number; x: number; y: number; error?: string }> {
    try {
        const session = await authClient.getSession();
        const user = session?.data?.user as AuthUser | undefined;
        if (!user?.id) {
            return {
                success: false,
                x: 0,
                y: 0,
                order: 0,
                error: 'User not logged in',
            };
        }

        const result = await (actions as any).updateGalaxyCoordinates({
            galaxyId,
            userId: user.id,
            x,
            y,
        });

        if (result.data?.success) {
            return {
                success: true,
                txId: result.data.txId,
                order: result.data.order,
                x: result.data.x,
                y: result.data.y,
            };
        }
        return {
            success: false,
            x: result.data?.x || 0,
            y: result.data?.y || 0,
            order: result.data?.order || 0,
            error: result.data?.error || 'Failed to update galaxy coordinates',
        };
    } catch (error) {
        console.error('Error updating galaxy coordinates:', error);
        return {
            success: false,
            x: 0,
            y: 0,
            order: 0,
            error: 'An error occurred',
        };
    }
}
