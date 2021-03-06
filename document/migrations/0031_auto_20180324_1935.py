# -*- coding: utf-8 -*-
# Generated by Django 1.11.11 on 2018-03-24 19:35
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('document', '0030_document_bibliography'),
    ]

    operations = [
        migrations.AlterField(
            model_name='accessright',
            name='rights',
            field=models.CharField(choices=[('read', 'Reader'), ('read-without-comments', 'Reader without comment access'), ('write', 'Writer'), ('write-tracked', 'Write with tracked changes'), ('review', 'Reviewer'), ('comment', 'Commentator'), ('edit', 'Editor')], max_length=21),
        ),
        migrations.AlterField(
            model_name='document',
            name='doc_version',
            field=models.DecimalField(decimal_places=1, default=2.1, max_digits=3),
        ),
    ]
