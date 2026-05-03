export const PLL_ARROWS: Record<string, string> = {
    // Edges Only
    'Ua': 'U7U3,U3U5,U5U7', // F->L->R->F
    'Ub': 'U7U5,U5U3,U3U7', // F->R->L->F
    'Z': 'U7U5,U5U7,U1U3,U3U1', // F<->R, B<->L
    'H': 'U7U1,U1U7,U3U5,U5U3', // F<->B, L<->R
    
    // Adjacent Corner Swap
    'Aa': 'U0U2,U2U8,U8U0', // BL->BR->FR->BL
    'Ab': 'U0U8,U8U2,U2U0', // BL->FR->BR->BL
    'T': 'U3U5,U5U3,U2U8,U8U2', // L<->R edges, BR<->FR corners
    'F': 'U7U1,U1U7,U2U8,U8U2', // F<->B edges, BR<->FR corners
    'Ja': 'U7U3,U3U7,U0U6,U6U0', // F<->L edges, BL<->FL corners
    'Jb': 'U7U5,U5U7,U2U8,U8U2', // F<->R edges, BR<->FR corners
    'Ra': 'U1U3,U3U1,U0U6,U6U0', // B<->L edges, BL<->FL corners
    'Rb': 'U1U5,U5U1,U2U8,U8U2', // B<->R edges, BR<->FR corners
    
    // Diagonal Corner Swap
    'E': 'U6U2,U2U6,U8U0,U0U8', // FL<->BR, FR<->BL corners
    'V': 'U5U7,U7U5,U8U0,U0U8', // R<->F edges, FR<->BL corners
    'Y': 'U3U7,U7U3,U6U2,U2U6', // L<->F edges, FL<->BR corners
    'Na': 'U6U2,U2U6,U8U0,U0U8', // FL<->BR, FR<->BL (Na is a diagonal swap of both)
    'Nb': 'U6U2,U2U6,U8U0,U0U8', // FL<->BR, FR<->BL
    
    // G Perms (Adjacent corner swap + edge cycle)
    // G perms are tricky, standard arrows usually show the adjacent corner swap and the 3-edge cycle
    'Ga': 'U6U0,U0U6,U7U1,U1U5,U5U7', // BL<->FL corners, F->B->R edges
    'Gb': 'U6U0,U0U6,U7U5,U5U1,U1U7', // BL<->FL corners, F->R->B edges
    'Gc': 'U8U2,U2U8,U7U1,U1U3,U3U7', // BR<->FR corners, F->B->L edges
    'Gd': 'U8U2,U2U8,U7U3,U3U1,U1U7', // BR<->FR corners, F->L->B edges
};
