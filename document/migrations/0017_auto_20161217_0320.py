# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-17 09:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('document', '0016_auto_20161031_1616'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='settings',
            field=models.TextField(default='{"doc_version":1.1}'),
        ),
    ]
