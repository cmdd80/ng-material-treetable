import { Node } from '../models';

export const mockComplexTree: Node<Mock> = {
  id: '1',
  value: {
    name: 'Reports',
    owner: 'Eric',
    protected: true,
    backup: true
  },
  children: [
    {
      id: '11',
      value: {
        name: 'Charts',
        owner: 'Stephanie',
        protected: false,
        backup: true
      },
      children: []
    },
    {
      id: '12',
      value: {
        name: 'Sales',
        owner: 'Virginia',
        protected: false,
        backup: true
      },
      children: []
    },
    {
      id: '13',
      value: {
        name: 'US',
        owner: 'Alison',
        protected: true,
        backup: false
      },
      children: [
        {
          id: '131',
          value: {
            name: 'California',
            owner: 'Claire',
            protected: false,
            backup: false
          },
          children: []
        },
        {
          id: '132',
          value: {
            name: 'Washington',
            owner: 'Colin',
            protected: false,
            backup: true
          },
          children: [
            {
              id: '1321',
              value: {
                name: 'Domestic',
                owner: 'Oliver',
                protected: true,
                backup: false
              },
              children: []
            },
            {
              id: '1322',
              value: {
                name: 'International',
                owner: 'Oliver',
                protected: true,
                backup: true
              },
              children: []
            }
          ]
        }
      ]
    }
  ]
};

export interface Mock {
  name: string;
  owner: string;
  protected: boolean;
  backup: boolean;
}